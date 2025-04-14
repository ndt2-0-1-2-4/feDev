import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spaceman',
  imports: [CommonModule, FormsModule],
  templateUrl: './spaceman.component.html',
  styleUrls: ['./spaceman.component.css'],
})
export class SpacemanComponent {
  @Input() label1: string = 'Tùy chọn rút tiền';
  @Input() label2: string = 'Tùy chọn rút tiền 50%';
  @Input() defaultValue1: number = 2.0;
  @Input() defaultValue2: number = 1.5;

  constructor() {}

  isActive: boolean = false;
  isActive1: boolean = false;
  isActive2: boolean = false;
  bet: boolean = false;
  selectedBet: number | null = null;
  value1: number = this.defaultValue1;
  value2: number = this.defaultValue2;
  value: number = 10000000000000;
  sumbet: number = 0;
  router: any;
  betButton: string = 'Đặt cược';
  countdown: number = 0;
  isMoon: boolean = false;
  isFlying: boolean = false;
  isMoving: boolean = false;
  showWithdrawButtons: boolean = false;
  multiplier: number = 1.0;
  multiplierInterval: any;
  hasWithdrawn: boolean = false;
  betTimeout: any;
  acceleration: number = 1.0;

  audio = new Audio('mucsic.mp3');
  loadAudio() {
    this.audio.load(); 
  }
  playAudio() {
    this.audio.play();
  }
  pouseAudio() {
    this.audio.pause(); 
  }

  toggleSwitch() {
    this.isActive = !this.isActive;
  }

  toggleSwitch1() {
    this.isActive1 = !this.isActive1;
  }

  changeValue(step: number) {
    this.value1 = Math.max(1.0, parseFloat((this.value1 + step).toFixed(2))); // Giới hạn min 1.00
  }

  changeValue1(step: number) {
    this.value2 = Math.max(1.0, parseFloat((this.value2 + step).toFixed(2))); // Giới hạn min 1.00
  }

  betAmounts: number[] = [
    5000, 25000, 50000, 125000, 250000, 500000, 1000000, 2500000,
  ];
  startIndex: number = 0; // Chỉ mục bắt đầu hiển thị

  // Lấy danh sách 3 số hiển thị hiện tại
  get visibleBets(): number[] {
    return this.betAmounts.slice(this.startIndex, this.startIndex + 3);
  }

  moveRight() {
    if (this.startIndex < this.betAmounts.length - 3) {
      this.startIndex++;
    }
  }

  moveLeft() {
    if (this.startIndex > 0) {
      this.startIndex--;
    }
  }

  selectBet(bet: number) {
    this.isActive2 = !this.isActive2;
    this.selectedBet = bet;
  }

  updateAcceleration() {
   
      if (this.multiplier < 3.0) {
          this.acceleration = 3.0;
      } else if (this.multiplier < 6.0) {
          this.acceleration = 4.5;
      } else if (this.multiplier < 9.0) {
          this.acceleration = 5.0;
      } else if (this.multiplier < 12.0) {
          this.acceleration = 3.5;
      } else if (this.multiplier < 15.0) {
          this.acceleration = 6.0;
      } else if (this.multiplier < 18.0) {
          this.acceleration = 7.5;
      } else {
          this.acceleration = 8.0; // Cực nhanh khi gần 20.0
      }

  
}

startMultiplier() {
    this.multiplier = 1.0;
    this.hasWithdrawn = false;
    const stopAt = parseFloat((Math.random() * 19 + 1).toFixed(1)); // Random từ 1.0 đến 20.0
    
    this.multiplierInterval = setInterval(() => {
        this.updateAcceleration(); // Cập nhật tốc độ
        this.multiplier = parseFloat((this.multiplier + 0.1 * this.acceleration).toFixed(1)); 
        
        if (this.multiplier >= stopAt) {
            this.stopMultiplier();
            clearTimeout(this.betTimeout);
        }
    }, 100); // Mỗi 100ms tăng hệ số nhân

    const stopTime = stopAt * 1000; // Thời gian dừng (ms)
    this.betTimeout = setTimeout(() => {
        this.betButton = 'Đặt cược';
        this.isFlying = false;
        this.isMoon = false;
        this.isMoving = false;
    }, stopTime);
}

  stopMultiplier() {
    clearInterval(this.multiplierInterval);
    clearTimeout(this.betTimeout); // Dừng setTimeout khi hệ số nhân dừng lại
    if (!this.hasWithdrawn) {
      alert('Bạn đã thua cược vì không rút tiền kịp thời!');
      this.showWithdrawButtons = false;
      this.multiplier = 1.0;
      this.selectedBet = null;
      this.countdown = 0;
      this.pouseAudio();
      this.betButton = 'Đặt cược';

    }
    this.isFlying = false; // Tắt trạng thái bay của phi hành gia sau khi hoàn thành
    this.isMoon = false; // Đặt lại hình ảnh của phi thuyền
    this.isMoving = false;
    // this.multiplier = 1.0;
  }

  betchoice() {

    if (this.betButton === 'Hủy đặt cược') {
      const result = confirm('Bạn có chắc chắn muốn hủy đặt cược?');
      if (result) {
        this.selectedBet = null;
        this.betButton = 'Đặt cược';
        this.countdown = 0;
        this.showWithdrawButtons = false; // Ẩn các nút rút tiền khi hủy đặt cược
        return;
      } else {
        return;
      }
    }

    if (this.selectedBet !== null) {
      if (this.value > this.selectedBet) {
        this.value -= this.selectedBet;
        this.sumbet += this.selectedBet;
        alert(`Bạn đã cược ${this.selectedBet} VND`);
        this.selectedBet = null;
      } else {
        alert('Số tiền cược không đủ');
        return;
      }
    } else {
      alert('Vui lòng chọn số tiền cược');
      return;
    }

    if (this.betButton === 'Đặt cược') {
      this.betButton = 'Hủy đặt cược';
      this.countdown = 5;
    }

    const countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(countdownInterval);
        this.betButton = 'Đặt cược thành công';
        this.playAudio();
        // this.hasWithdrawn = true;
        this.isFlying = true; // Kích hoạt trạng thái bay của phi hành gia
        this.isMoon = true; // Thay đổi hình ảnh của phi thuyền thành mặt trăng
        this.isMoving = true;
        this.showWithdrawButtons = true; // Hiển thị các nút rút tiền sau khi đếm ngược kết thúc

        // Bắt đầu hiển thị số nhân
        this.startMultiplier();
        // audio.pause();
      }
    }, 1000); // Cập nhật mỗi giây
  }

  withdraw() {
    if(this.hasWithdrawn = true)
    {
    
      this.stopMultiplier();
      const winnings = (this.selectedBet ?? 0) * this.multiplier;
      this.value += winnings;
      alert(`Bạn đã rút tiền thành công và nhận được ${winnings} VND`);
      this.hasWithdrawn = false;
      this.isMoving = false;
      this.pouseAudio();
      this.showWithdrawButtons = false;
      this.multiplier = 1.0;
      this.betButton = 'Đặt cược';
      this.router.navigate(['/game/spaceman']); // Điều hướng về trang chủ game Spaceman
    }
  }

  withdraw50() {
    this.hasWithdrawn = true;
    this.stopMultiplier();
    const winnings = (this.selectedBet ?? 0 * this.multiplier) / 2;
    this.value += winnings;
    alert(`Bạn đã rút 50% tiền thành công và nhận được ${winnings} VND`);
    this.hasWithdrawn = false;
    this.isMoving = false;
    this.pouseAudio();
    this.showWithdrawButtons = false;
    this.multiplier = 1.0;
    this.betButton = 'Đặt cược';
    this.router.navigate(['/game/spaceman']); // Điều hướng về trang chủ game Spaceman
  }

  exit() {
    const result = confirm("Bạn có chắc chắn muốn tiếp tục?");
    if (result) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/game/spaceman']);
    }
  }
}
