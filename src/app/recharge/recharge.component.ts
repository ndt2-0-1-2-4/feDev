import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recharge',
  imports: [CommonModule, FormsModule],
  templateUrl: './recharge.component.html',
  styleUrl: './recharge.component.css'
})
export class RechargeComponent {
  activeTab: string = '';
  activeChoice: string = '';
  amount: '200,000' | undefined;
  countdown: string = '15:00';
  private countdownInterval: any;

  ngOnInit() {
    this.startCountdown(15 * 60);
    this.startPrizeCountdown(7 * 3600 + 59 * 60 + 59);
  }

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

  bankInfo = {
    accountNumber: '19035983187012',
    accountHolder: 'Chương Nhược Nam',
    transactionCode: 'U1UK5CXJ'
  };

  wallets = {
    momo: {
      phoneNumber: '0901234567',
      accountName: 'Momo User',
      transactionCode: 'MOMO12345',
      qrCode: 'dia.png'
    },
    vnpay: {
      phoneNumber: '0912345678',
      accountName: 'VNPay User',
      transactionCode: 'VNPAY67890',
      qrCode: 'dia.png'
    },
    zalopay: {
      phoneNumber: '0923456789',
      accountName: 'ZaloPay User',
      transactionCode: 'ZALO54321',
      qrCode: 'dia.png'
    }
  };


  selectedWallet = this.wallets.momo;
  activeWallet = 'momo';

  selectWallet(walletType: keyof typeof this.wallets) {
    this.selectedWallet = this.wallets[walletType];
    this.activeWallet = walletType;
  }

  showContent(tab: string) {
    this.activeTab = tab;
    this.activeChoice = '';
  }
  showChoice(choice: string) {
    this.activeChoice = choice;
  }

  generateNewTransactionCode() {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.bankInfo.transactionCode = newCode;
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
    { reward: '10.000', deposit: '2.000.000' },
    { reward: '58.000', deposit: '10.000.000' },
    { reward: '318.000', deposit: '50.000.000' },
    { reward: '680.000', deposit: '100.000.000' },
    { reward: '1.580.000', deposit: '200.000.000' }
  ];


}
