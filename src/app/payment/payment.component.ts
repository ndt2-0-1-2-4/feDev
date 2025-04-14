// src/app/components/payment/payment.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService ,PaymentRequest} from '../service/payment.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
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

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Kiểm tra xem có phải là callback từ VnPay không
    this.route.queryParams.subscribe(params => {
      if (params['vnp_ResponseCode']) {
        this.handlePaymentCallback(params);
      }
    });

    this.startCountdown(15 * 60);
    this.startPrizeCountdown(7 * 3600 + 59 * 60 + 59);
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
  
  copyToClipboard(value: string) {
    navigator.clipboard.writeText(value).then(() => {
      alert('Đã sao chép: ' + value);
    });
  }

  // bankInfo = {
  //   accountNumber: '19035983187012',
  //   accountHolder: 'Chương Nhược Nam',
  //   transactionCode: 'U1UK5CXJ'
  // };

  // wallets = {
  //   momo: {
  //     phoneNumber: '0901234567',
  //     accountName: 'Momo User',
  //     transactionCode: 'MOMO12345',
  //     qrCode: 'dia.png'
  //   },
  //   vnpay: {
  //     phoneNumber: '0912345678',
  //     accountName: 'VNPay User',
  //     transactionCode: 'VNPAY67890',
  //     qrCode: 'dia.png'
  //   },
  //   zalopay: {
  //     phoneNumber: '0923456789',
  //     accountName: 'ZaloPay User',
  //     transactionCode: 'ZALO54321',
  //     qrCode: 'dia.png'
  //   }
  // };


  // selectedWallet = this.wallets.momo;
  // activeWallet = 'momo';

  // selectWallet(walletType: keyof typeof this.wallets) {
  //   this.selectedWallet = this.wallets[walletType];
  //   this.activeWallet = walletType;
  // }

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

  // generateNewTransactionCode() {
  //   const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  //   this.bankInfo.transactionCode = newCode;
  // }

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
    { reward: '10.000', deposit: '2.000.000' },
    { reward: '58.000', deposit: '10.000.000' },
    { reward: '318.000', deposit: '50.000.000' },
    { reward: '680.000', deposit: '100.000.000' },
    { reward: '1.580.000', deposit: '200.000.000' }
  ];
}