import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { WebSocketService } from '../../service/socket.service';
import { userService } from '../../service/users.service';
import { GameService } from '../../service/game.service';
import { environment } from '../../../environments/environment';
import { AtmService } from '../../service/atm.service';
@Component({
  selector: 'app-cl',
  imports: [CommonModule],
  templateUrl: './cl.component.html',
  styleUrls: ['./cl.component.css'],
})
export class ClComponent implements OnInit {
  @ViewChild('draggable', { static: true }) draggableElement!: ElementRef;
  @ViewChild('countdown', { static: true }) countdownElement!: ElementRef;
  @ViewChild('dice1', { static: true }) diceElement!: ElementRef;
  @ViewChild('chan', { static: true }) chanElement!: ElementRef;
  @ViewChild('le', { static: true }) leElement!: ElementRef;
  @ViewChild('cuoc_chan', { static: true }) cuoc_chanElement!: ElementRef;
  @ViewChild('cuoc_le', { static: true }) cuoc_leElement!: ElementRef;
  @ViewChild('sum_le', { static: true }) sumBet_le!: ElementRef;
  @ViewChild('sum_chan', { static: true }) sumBet_chan!: ElementRef;
  @ViewChild('betvalua_chan', { static: true })
  betvalua_chanElement!: ElementRef;
  @ViewChild('betvalua_le', { static: true })
  betvalua_leElement!: ElementRef;
  money : number = 0;
  isCountingDown: boolean = false;
  isDragging: boolean = false;
  offsetX: number = 0;
  offsetY: number = 0;
  initialPosition: { x: number; y: number } = { x: 0, y: 0 };
  //be
  urlSocketCl: string = environment.urlSocketCl;
  totalMoneyL = 0;
  totalMoneyC = 0;
  messages: any[] = [];
  messageInput: string = '';
  isConnected = false;
  isClieckToggle: boolean = false;
  private messageSubscription!: Subscription;
  private connectionSubscription!: Subscription;
  constructor(
    private router: Router,
    private socket: WebSocketService,
    private userService: userService,
    private gameService: GameService,
    private atmService: AtmService
  ) {}

  ngOnInit(): void {
    this.userService.getUser();
    this.money = parseInt(this.userService.getBalanceCookies());
    // Kết nối tới WebSocket
    let idUser: any = this.userService.getCookies();
    console.log(idUser);
    this.urlSocketCl += '?id=' + idUser;
    this.socket.connect(this.urlSocketCl);
    //Lắng nghe tin nhắn
    this.messageSubscription = this.socket
      .getMessages()
      .subscribe((messageData) => {
        const parsedMessage = JSON.parse(messageData.message);
        if (messageData.url === this.urlSocketCl) {
          if (!this.isConnected) {
            this.isConnected = true;
            this.startCountdown(
              parsedMessage,
              this.countdownElement.nativeElement
            );
          }
          switch (parsedMessage.type) {
            case 'start':
              this.startCountdown(14, this.countdownElement.nativeElement);
              break;
            case 'end':
              this.rollDice(Number(parsedMessage.message));
              break;
            case 'money':
              const input: string = parsedMessage.message;
              const parts: string[] = input.split(':');
              const firstNumber: number = Number(parts[0]);
              const secondNumber: number = Number(parts[1]);
              this.sumBet_chan.nativeElement.textContent = firstNumber;
              this.sumBet_le.nativeElement.textContent = secondNumber;
              break;
            case 'reward':
              const reward: number = Number(parsedMessage.reward);
              let playerId = this.userService.getCookies();
              const rs = parsedMessage.result; // Kết quả: 0 => chẵn, 1 => lẻ
              const moneyBet = parsedMessage.bet; // Tiền cược
              const choiceBet = parsedMessage.choice; // Lựa chọn người chơi: 'chan' hoặc 'le'
              const goldElement = document.querySelector('.gold');
              const gold = goldElement?.textContent
              if(goldElement && gold && reward>0){
                let tempGold=parseInt(gold,10)+reward*2
                goldElement.textContent = tempGold.toString();
                this.userService.setBalanceCookies(tempGold)
                this.atmService.updateBalan(reward*2,this.userService.getCookies()).subscribe()
                this.atmService.saveHisBalance(this.userService.getCookies(),"Trả thưởng chẵn lẻ",reward*2,tempGold).subscribe()
              }

              console.log( parsedMessage)
              break;
              
          }
          this.messages.push(messageData.message);
        }
      });
    this.initialPosition = {
      x: this.draggableElement.nativeElement.offsetLeft,
      y: this.draggableElement.nativeElement.offsetTop,
    };
    this.getHistory();
  }

  startCountdown(duration: number, display: HTMLElement): void {
    this.resetPosition();
    this.chanElement.nativeElement.classList.remove('blink-animation');
    this.leElement.nativeElement.classList.remove('blink-animation');
    this.resetBet();
    this.isCountingDown = true;
    this.draggableElement.nativeElement.classList.add('disabled');
    let timer = duration;
    const interval = setInterval(() => {
      const minutes = Math.floor(timer / 60);
      let seconds = timer % 60;

      const stringSeconds: string =
        seconds < 10 ? '0' + seconds : seconds.toString();
      display.textContent = stringSeconds;

      if (--timer < 0) {
        clearInterval(interval);
        this.isCountingDown = false;
        this.draggableElement.nativeElement.classList.remove('disabled');
        this.isClieckToggle = false;
      }
    }, 1000);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.isCountingDown) {
      this.isDragging = true;
      this.draggableElement.nativeElement.style.cursor = 'grabbing';
      this.offsetX =
        event.clientX - this.draggableElement.nativeElement.offsetLeft;
      this.offsetY =
        event.clientY - this.draggableElement.nativeElement.offsetTop;
    } else {
      event.preventDefault();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && !this.isCountingDown) {
      this.draggableElement.nativeElement.style.left = `${
        event.clientX - this.offsetX
      }px`;
      this.draggableElement.nativeElement.style.top = `${
        event.clientY - this.offsetY
      }px`;
    }
  }

  @HostListener('mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      if (!this.isCountingDown) {
        this.draggableElement.nativeElement.style.cursor = 'grab';
      }
    }
  }

  resetPosition(): void {
    this.draggableElement.nativeElement.style.left = `${this.initialPosition.x}px`;
    this.draggableElement.nativeElement.style.top = `${this.initialPosition.y}px`;
  }

  rollDice(random: number): void {
    let transformValue: string;
    switch (random) {
      case 1:
        transformValue = 'rotateX(0deg) rotateY(0deg)';
        break;
      case 2:
        transformValue = 'rotateX(-90deg) rotateY(0deg)';
        break;
      case 3:
        transformValue = 'rotateX(0deg) rotateY(90deg)';
        break;
      case 4:
        transformValue = 'rotateX(0deg) rotateY(-90deg)';
        break;
      case 5:
        transformValue = 'rotateX(90deg) rotateY(0deg)';
        break;
      case 6:
        transformValue = 'rotateX(180deg) rotateY(0deg)';
        break;
      default:
        transformValue = 'rotateX(0deg) rotateY(0deg)';
        break;
    }

    const animation: Keyframe[] = [
      { transform: 'rotateX(0deg) rotateY(0deg)' },
      { transform: 'rotateX(720deg) rotateY(720deg)' },
      { transform: transformValue },
    ];

    const timing: KeyframeAnimationOptions = {
      duration: 4000,
      iterations: 1,
      fill: 'forwards',
      easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
    };
    const diceAnimation = this.diceElement.nativeElement.animate(
      animation,
      timing
    );
    diceAnimation.addEventListener('finish', () => {
      if (random % 2 === 0) {
        this.chanElement.nativeElement.classList.add('blink-animation');
      } else {
        this.leElement.nativeElement.classList.add('blink-animation');
      }
      this.getHistory();
    });
  }

  //Xử lý logic button cược
  private hiddenButton: ElementRef<HTMLButtonElement> | null = null;
  private sumBetElement: ElementRef<HTMLSpanElement> | null = null;
  isOptions: boolean = false;
  toggleButton(
    button: ElementRef<HTMLButtonElement>,
    sum: ElementRef<HTMLSpanElement>
  ) {
    if (this.userService.getCookies() === '') return;
    if (!this.isClieckToggle) return;
    this.sumBetElement = sum;
    if (this.hiddenButton === button) {
      return;
    }

    // Hiện lại button đang ẩn (nếu có)
    if (this.hiddenButton) {
      this.hiddenButton.nativeElement.textContent = 'Đặt cược';
    }

    // Ẩn button được click
    button.nativeElement.textContent = '0';
    // Lưu trữ button đang ẩn
    this.hiddenButton = button;
    this.isOptions = true;
  }
  cancelCuoc() {
    if (this.hiddenButton) {
      this.hiddenButton.nativeElement.textContent = 'Đặt cược';
      this.hiddenButton = null;
      this.isOptions = false;
    }
  }

  updateBetValue(amount: number): void {
    const doorBet = this.hiddenButton?.nativeElement;
    let tempBet: any;
    tempBet = doorBet?.textContent;
    let currentBet = parseInt(tempBet, 10);
    if (doorBet) {
      if(amount > parseInt(this.userService.getBalanceCookies())){
        alert('Số dư không đủ');
        return;
      }
      currentBet += amount;
      doorBet.innerHTML = currentBet.toString();
    } else {
      console.error("Element with ID 'bet-value' not found!");
    }
  }

  bet() {
    if (this.hiddenButton && this.sumBetElement) {
      let tempSum: any;
      let tempBet: any;
      tempSum = this.sumBetElement.nativeElement.textContent;
      tempBet = this.hiddenButton.nativeElement.textContent;
      let Bet = parseInt(tempBet, 10);
      let Sum = parseInt(tempSum, 10);
      Sum += Bet;
      this.sumBetElement.nativeElement.textContent = Sum.toString();
      const goldElement = document.querySelector('.gold');
      const gold = goldElement?.textContent
      if(goldElement && gold){
        let tempGold=parseInt(gold,10)-Bet
        goldElement.textContent = tempGold.toString();
        this.userService.setBalanceCookies(tempGold)
        this.atmService.updateBalan(-Bet,this.userService.getCookies()).subscribe()
        this.atmService.saveHisBalance(this.userService.getCookies(),"Cược chẵn lẻ",-Bet,tempGold).subscribe()
      }
      this.sendBet(this.hiddenButton.nativeElement.id, Bet);
      this.cancelCuoc();
    }
  }
  // allIn(): void {
  //   // Assuming all-in means setting the bet to a maximum value, e.g., 100M
  //   let currentBet = 0;
  //   currentBet = 100000000;
  //   const betValueElement = document.getElementById('bet-value');
  //   if (betValueElement) {
  //     betValueElement.innerText = currentBet.toString();
  //   } else {
  //     console.error("Element with ID 'bet-value' not found!");
  //   }
  // }

  resetBet() {
    let sumC = document.getElementById('sum_chan');
    let sumL = document.getElementById('sum_le');
    this.isClieckToggle = true;
    if (sumC && sumL) {
      sumC.textContent = '0';
      sumL.textContent = '0';
    }
    this.cancelCuoc();
  }

  //get lịch sử kết quả
  getHistory() {
    const his_rs = document.querySelector('.his-rs');
    if (his_rs) {
      his_rs.innerHTML = '';
      this.gameService.getHistory('Chẵn lẻ').subscribe(
        (data: any) => {
          for (let i = 0; i < data.length; i++) {
            const cricleHis = document.createElement('div');
            if (data[i].result % 2 == 0) {
              cricleHis.style.background = 'rgb(3, 74, 100)';
            } else {
              cricleHis.style.background = 'rgb(85, 3, 3)';
            }
            cricleHis.className = 'circle-rs';
            cricleHis.textContent = data[i].result;
            cricleHis.style.width = '1rem';
            cricleHis.style.height = '1rem';
            cricleHis.style.borderRadius = '9999px';
            cricleHis.style.border = '2px solid #d69e2e';
            cricleHis.style.margin = '0 0.125rem';
            cricleHis.style.display = 'flex';
            cricleHis.style.justifyContent = 'center';
            cricleHis.style.alignItems = 'center';
            cricleHis.style.fontSize = '.85rem';
            cricleHis.style.color = '#fff';
            his_rs.appendChild(cricleHis);
          }
        },
        (error: any) => {
          console.error(error);
        }
      );
    }
  }
  // websocket
  sendBet(choice: string, money: any) {
    let data = {
      type: 'bet',
      choice: choice,
      money: money,
    };
    let jsonData = JSON.stringify(data);
    this.socket.sendMessage(this.urlSocketCl, jsonData);
  }
}
