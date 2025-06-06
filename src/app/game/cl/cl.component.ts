import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { WebSocketService } from '../../service/socket.service';
import { userService } from '../../service/users.service';
import { AtmService } from '../../service/atm.service';
import { GameService } from '../../service/game.service';
import { Subscription, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-cl',
  imports: [NgIf, NgFor, CommonModule],
  templateUrl: './cl.component.html',
  styleUrls: ['./cl.component.css'],
})
export class ClComponent implements OnInit {
  @ViewChild('chanElement') chanElement!: ElementRef;
  @ViewChild('leElement') leElement!: ElementRef;
  @ViewChild('dice1', { static: true }) dice1!: ElementRef;
  @ViewChild('dice2', { static: true }) dice2!: ElementRef;
  @ViewChild('dice3', { static: true }) dice3!: ElementRef;
  @ViewChild('draggable', { static: true }) draggableElement!: ElementRef;
  isCountingDown: boolean = false;
  isDragging: boolean = false;
  offsetX: number = 0;
  offsetY: number = 0;
  initialPosition: { x: number; y: number } = { x: 50, y: 50 };
  taiAmount: number = 0;
  xiuAmount: number = 0;
  tempBetAmount: number = 0;
  taiBetDisplay: number = -1;
  xiuBetDisplay: number = -1;
  countdown: number = 0;
  totalScore: number = 0;
  players: number = 5;
  history: string[] = [];
  selectedBet: number = 100;
  showOptionsAndActions: boolean = false;
  selectedBetType: string | null = null;
  urlSocketCl: string = environment.urlSocketCl;
  private messageSubscription!: Subscription;
  isConnected = false;
  messages: any[] = [];
  isLoadHis = true;
  constructor(
    private socket: WebSocketService,
    private userService: userService,
    private gameService: GameService,
    private atmService: AtmService,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    let idUser: any = this.userService.getCookies();
    this.urlSocketCl += '?id=' + idUser;
    this.socket.connect(this.urlSocketCl);
    this.messageSubscription = this.socket
      .getMessages()
      .subscribe((messageData: any) => {
        if (messageData.message === -1) this.isLoadHis = false;
        const parsedMessage = JSON.parse(messageData.message);
        if (messageData.url === this.urlSocketCl) {
          switch (parsedMessage.type) {
            case 'infobet':
              this.isConnected = true;
              this.selectedBetType = parsedMessage.guess;
              if (this.selectedBetType === 'tai') {
                this.taiBetDisplay = parsedMessage.money;
              } else if (this.selectedBetType === 'xiu') {
                this.xiuBetDisplay = parsedMessage.money;
              }
              break;
            case 'start':
              this.isCountingDown = true;
              this.reset();
              if (this.isLoadHis)
                this.addToHistory(this.totalScore > 10 ? 'tai' : 'xiu');
              this.isLoadHis = true;
              this.countdown = parsedMessage.message;
              break;
            case 'end':
              this.reset();
              this.isCountingDown = false;
              const numbers = parsedMessage.message.split(',').map(Number);
              this.rollDice(numbers);
              break;
            case 'money':
              this.isCountingDown = true;
              const input: string = parsedMessage.message;
              const parts: string[] = input.split(':');
              this.countdown = Number(parts[0]);
              this.xiuAmount = Number(parts[1]);
              this.taiAmount = Number(parts[2]);
              break;
            case 'reward':
              const reward: number = Number(parsedMessage.reward);
              let playerId = this.userService.getCookies();
              const rs: string = parsedMessage.result.join(':');
              const moneyBet = parsedMessage.bet; // Tiền cược
              const choiceBet = parsedMessage.choice;
              if (reward > 0) {
                let tempGold = this.atmService.getBalance() || 0;
                tempGold += reward * 2;
                timer(5000).subscribe(() => {
                  this.atmService.setBalance(reward * 2);
                  this.toastr.success('Chúc mừng thiếu chủ', 'Thông báo');
                });
                this.atmService
                  .updateBalan(reward * 2, this.userService.getCookies())
                  .subscribe();
                this.userService
                  .saveBetHis(
                    'Tài xỉu',
                    playerId,
                    rs,
                    moneyBet,
                    reward * 2,
                    choiceBet
                  )
                  .subscribe();
                this.atmService
                  .saveHisBalance(
                    this.userService.getCookies(),
                    'Trả thưởng Tài xỉu',
                    reward * 2,
                    tempGold
                  )
                  .subscribe();
              } else {
                this.userService
                  .saveBetHis(
                    'Tài xỉu',
                    playerId,
                    rs,
                    moneyBet,
                    reward * 2,
                    choiceBet
                  )
                  .subscribe();
              }
              break;
          }
          this.messages.push(messageData.message);
        }
      });
    if (this.isLoadHis) this.getHistory();
  }
  getHistory() {
    this.gameService.getHistory('Tài xỉu').subscribe((data: any) => {
      let isFirst = true;
      data.forEach((element: any) => {
        let numbers = element.result.split(',').map(Number);
        let sum = 0;
        numbers.forEach((e: any) => {
          sum += e;
        });
        if (isFirst) {
          this.totalScore = sum;
          isFirst = false;
        }
        this.addToHistory(sum > 10 ? 'tai' : 'xiu');
      });
      this.history = this.history.slice().reverse();
    });
    if (this.countdown > 0) {
      this.isLoadHis = false;
    }
  }
  reset(): void {
    this.cancelBet();
    this.xiuBetDisplay = -1;
    this.taiBetDisplay = -1;
  }
  toggleBet(type: string): void {
    if (
      this.taiBetDisplay !== -1 ||
      this.xiuBetDisplay !== -1 ||
      !this.isCountingDown
    ) {
      return;
    }
    if (this.selectedBetType !== type) {
      this.taiBetDisplay = -1;
      this.xiuBetDisplay = -1;
    }

    this.selectedBetType = type;
    this.tempBetAmount = 0;
    this.showOptionsAndActions = true;

    if (type === 'tai') {
      this.taiBetDisplay = 0;
    } else if (type === 'xiu') {
      this.xiuBetDisplay = 0;
    }
  }

  selectBetAmount(amount: number): void {
    const gold = this.atmService.getBalance();
    if (!gold) {
      return;
    }
    if (this.tempBetAmount + amount > gold) {
      this.toastr.warning('Số dư không đủ', 'Thông báo');
      return;
    }
    this.tempBetAmount += amount;
    // Cập nhật số tiền hiển thị và tổng cược
    if (this.selectedBetType === 'tai') {
      this.taiBetDisplay = this.tempBetAmount;
    } else if (this.selectedBetType === 'xiu') {
      this.xiuBetDisplay = this.tempBetAmount;
    }
  }

  placeBet(): void {
    if (this.selectedBetType === 'tai') {
      this.taiAmount += this.tempBetAmount;
    } else if (this.selectedBetType === 'xiu') {
      this.xiuAmount += this.tempBetAmount;
    }
    this.showOptionsAndActions = false;
    const gold = this.atmService.getBalance() || 0;
    this.atmService.setBalance(-this.tempBetAmount);
    let tempGold = gold - this.tempBetAmount;
    this.atmService
      .updateBalan(-this.tempBetAmount, this.userService.getCookies())
      .subscribe();
    this.atmService
      .saveHisBalance(
        this.userService.getCookies(),
        'Cược Tài xỉu',
        -this.tempBetAmount,
        tempGold
      )
      .subscribe();
    this.sendBet();
  }

  cancelBet(): void {
    if (this.selectedBetType === 'tai') {
      this.taiAmount -= this.tempBetAmount;
      this.taiBetDisplay = -1;
    } else if (this.selectedBetType === 'xiu') {
      this.xiuAmount -= this.tempBetAmount;
      this.xiuBetDisplay = -1;
    }
    this.showOptionsAndActions = false;
    this.selectedBetType = null;
    this.tempBetAmount = 0;
  }

  allIn(): void {
    if (this.selectedBetType === 'tai') {
      this.taiAmount -= this.tempBetAmount;
      this.taiBetDisplay = -1;
    } else if (this.selectedBetType === 'xiu') {
      this.xiuAmount -= this.tempBetAmount;
      this.xiuBetDisplay = -1;
    }

    // Đặt cược tối đa 
    this.tempBetAmount = this.atmService.getBalance() || 0;
    if (this.selectedBetType === 'tai') {
      this.taiBetDisplay = this.tempBetAmount;
      this.taiAmount += this.tempBetAmount;
    } else if (this.selectedBetType === 'xiu') {
      this.xiuBetDisplay = this.tempBetAmount;
      this.xiuAmount += this.tempBetAmount;
    }
  }
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.draggableElement.nativeElement.style.cursor = 'grabbing';
    this.offsetX =
      event.clientX - this.draggableElement.nativeElement.offsetLeft;
    this.offsetY =
      event.clientY - this.draggableElement.nativeElement.offsetTop;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
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
    }
  }
  rollDice(random: number[]): void {
    const dice1Random = random[0];
    const dice2Random = random[1];
    const dice3Random = random[2];

    this.totalScore = dice1Random + dice2Random + dice3Random;

    const getTransformValue = (num: number): string => {
      switch (num) {
        case 1:
          return 'rotateX(0deg) rotateY(0deg)';
        case 2:
          return 'rotateX(-90deg) rotateY(0deg)';
        case 3:
          return 'rotateX(0deg) rotateY(90deg)';
        case 4:
          return 'rotateX(0deg) rotateY(-90deg)';
        case 5:
          return 'rotateX(90deg) rotateY(0deg)';
        case 6:
          return 'rotateX(180deg) rotateY(0deg)';
        default:
          return 'rotateX(0deg) rotateY(0deg)';
      }
    };

    // Animation keyframes
    const animation: Keyframe[] = [
      { transform: 'rotateX(0deg) rotateY(0deg)' },
      { transform: 'rotateX(720deg) rotateY(720deg)' },
    ];

    const timing: KeyframeAnimationOptions = {
      duration: 4000,
      iterations: 1,
      fill: 'forwards',
      easing: 'cubic-bezier(0.42, 0, 0.58, 1)',
    };

    // Apply animation to all three dice
    const dices = [
      { element: this.dice1.nativeElement, random: dice1Random },
      { element: this.dice2.nativeElement, random: dice2Random },
      { element: this.dice3.nativeElement, random: dice3Random },
    ];

    dices.forEach((dice) => {
      const finalTransform = getTransformValue(dice.random);
      const diceAnimation = dice.element.animate(
        [...animation, { transform: finalTransform }],
        timing
      );
    });
  }
  addToHistory(betType: string): void {
    const result = betType === 'tai' ? 'black' : 'white';
    this.history.push(result);

    // Giới hạn lịch sử tối đa 10 phần tử
    if (this.history.length > 10) {
      this.history.shift(); // Xóa phần tử cũ nhất
    }
  }
  sendBet() {
    let data = {
      type: 'bet',
      choice: this.selectedBetType,
      money: this.tempBetAmount,
    };
    let jsonData = JSON.stringify(data);
    this.socket.sendMessage(this.urlSocketCl, jsonData);
  }
}
