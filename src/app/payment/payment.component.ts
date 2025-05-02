// src/app/components/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService ,PaymentRequest} from '../service/payment.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { userService } from '../service/users.service';
import { AtmService } from '../service/atm.service';
import { response } from 'express';

@Component({
  selector: 'app-payment',
  imports:[FormsModule,NgIf,CommonModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  paymentRequest: PaymentRequest = {
    amount: 0, // Số tiền mặc định (đơn vị VND)
    orderInfo: 'Thanh toan don hang', // Thông tin đơn hàng
    orderType: '250000' // Mã loại hàng hóa, tham khảo tài liệu VnPay
  };

  isProcessing = false;
  paymentMessage = '';    
  paymentStatus = '';

  totalDeposit: number = 0;
  reward: number = 0;

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: userService,
    private atmService: AtmService
  ) { }

  ngOnInit(): void {
    // Kiểm tra xem có phải là callback từ VnPay không
    this.route.queryParams.subscribe(params => {
      if (params['vnp_ResponseCode']) {
        this.handlePaymentCallback(params);
      }
    });

  this.atmService.calculateReward(Number(this.userService.getCookies())).subscribe((response: any) => {
    this.totalDeposit = response.totalDeposit;
    this.reward = response.reward;
    console.log(response);
  });

}
  // Xử lý khi người dùng nhấn nút thanh toán
  processPayment(): void {
    this.isProcessing = true;
    this.paymentMessage = 'Đang xử lý yêu cầu thanh toán...';


    this.paymentService.createPayment(this.paymentRequest).subscribe({
      next: (response) => {
        // Chuyển hướng người dùng đến trang thanh toán của VnPay
        window.location.href = response.paymentUrl;
      },
      error: (error) => {
        this.isProcessing = false;
        this.paymentMessage = 'Đã xảy ra lỗi: ' + (error.message || 'Không thể tạo yêu cầu thanh toán');
        console.error('Payment error:', error);
      }
    });
  }

  // Xử lý callback từ VnPay
  private handlePaymentCallback(params: any): void {
    // Lưu ý: Trong ứng dụng thực tế, cần xử lý callback này ở backend để đảm bảo an toàn
    if (params['vnp_ResponseCode'] === '00') {
      this.paymentStatus = 'success';
      this.paymentMessage = 'Thanh toán thành công! Mã giao dịch: ' + params['vnp_TransactionNo'];
      console.log("OKKK")
    } else {
      this.paymentStatus = 'failed';
      this.paymentMessage = 'Thanh toán thất bại! Mã lỗi: ' + params['vnp_ResponseCode'];
    }
  }

  activeTab: string = 'content';
  activeChoice: string = 'wallet';
  amount: '200,000' | undefined;
  countdown: string = '15:00';
  private countdownInterval: any;


  startCountdown(duration: number) {
    let timeLeft = duration;

    this.countdownInterval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      this.countdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      if (timeLeft <= 0) {
        clearInterval(this.countdownInterval);
        this.countdown = '00:00'; // Khi hết giờ
      }

      timeLeft--;
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.prizeCountdownInterval) {
      clearInterval(this.prizeCountdownInterval);
    }
  }
  

  showContent(tab: string) {
    this.activeTab = tab;
    this.activeChoice = '';
    if (tab === 'content') {
      this.activeChoice = 'wallet'; 
    }
  }
  showChoice(choice: string) {
    this.activeChoice = choice;
  }


  hours: number = 7;
  minutes: number = 59;
  seconds: number = 59;
  private prizeCountdownInterval: any;

  startPrizeCountdown(duration: number) {
    let timeLeft = duration;

    this.prizeCountdownInterval = setInterval(() => {
      this.hours = Math.floor(timeLeft / 3600);
      this.minutes = Math.floor((timeLeft % 3600) / 60);
      this.seconds = timeLeft % 60;

      if (timeLeft <= 0) {
        clearInterval(this.prizeCountdownInterval);
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
      }

      timeLeft--;
    }, 1000);
  }

  bonuses = [
    { reward: '40.000', deposit: '2.000.000' },
    { reward: '100.000', deposit: '10.000.000' },
    { reward: '360.000', deposit: '50.000.000' },
    { reward: '879.000', deposit: '100.000.000' },
    { reward: '1.579.000', deposit: '200.000.000' }
  ];

  goToWallet() {
    this.activeTab = 'content';
    this.activeChoice = 'wallet';
  }


  

}