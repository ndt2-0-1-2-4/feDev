// payment-result.component.ts
import { NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute ,Router} from '@angular/router';
import { AtmService } from '../service/atm.service';
import { userService } from '../service/users.service';
import { PaymentService } from '../service/payment.service';
@Component({
  selector: 'app-payment-result',
  imports: [NgIf],
  styleUrls: ['./payment-result.component.css'],
  templateUrl:'./payment-result.component.html' 
})
export class PaymentResultComponent implements OnInit {
  responseCode = '';
  responseMessage = '';
  amount = 0;
  countdown: number = 5; 
  interval: any; 
  money :number=0;
  constructor(
    private route: ActivatedRoute,
    private atmService: AtmService,
    private userService: userService,
    private paymentService: PaymentService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.startCountdown()
  }
  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    window.location.replace('/')
    event.preventDefault();
    event.returnValue = 'Cẩn thận'; // Hiển thị cảnh báo trên trình duyệt
  }
  startCountdown(): void {
    this.interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.interval);
        // Thực hiện hành động khi đếm ngược kết thúc
        this.route.queryParams.subscribe((params:any) => {
          this.responseCode = params['vnp_ResponseCode'];
          this.responseMessage = params.message;
          this.amount = params.vnp_Amount ? parseInt(params.vnp_Amount) / 100 : 0; // Chia cho 100 để chuyển đổi từ VND sang VNĐ
          const goldElement = document.querySelector('.gold');
          const gold = goldElement?.textContent
          if(gold){
            this.money = parseInt(gold);
          }
          this.money +=this.amount
          this.atmService.saveHisBalance(this.userService.getCookies(),"Nạp tiền "+params.vnp_SecureHash,this.amount,this.money).subscribe((response:any) => {
            console.log('Lưu lịch sử thành công:', response);
          }
          , (error:any) => {
            console.log('Lưu lịch sử thất bại:', error);
          }
          );
          this.atmService.updateBalan(this.amount,this.userService.getCookies()).subscribe(
            (response:any) => {
              console.log('Cập nhật số dư thành công:', response);
            },
            (error:any) => {
              console.log('Cập nhật số dư thất bại:', error);
            }
          )
          localStorage.setItem("payStatus",this.responseCode)
        });
        window.location.replace('/')
      }
    }, 1000); // Giảm mỗi giây
  }
}