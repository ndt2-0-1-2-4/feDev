import { Component } from '@angular/core';
import { userService } from '../service/users.service';
import { FriendService } from '../service/friend.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { error } from 'node:console';
import { NgxPaginationModule } from 'ngx-pagination';
import { AtmService } from '../service/atm.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { subscribe } from 'node:diagnostics_channel';
@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {

  changeDetectorRef: any;
  showForm: boolean = false;
  newStk: string = ''; 
  constructor(
    private userService: userService,
    private friendService: FriendService,
    private atm: AtmService,
    private toastr: ToastrService,
    private http : HttpClient
  ) { }
  fullname: any;
  money: any;
  numberFriend: any = 0;
  friends: any[] = [];
  stk: any;
  pages: number = 1;
  itemsPerPage: number = 4; // Số mục trên mỗi trang

  lichSuCuoc: {
    namegame: string,
    ketQua: string,
    soTienCuoc: number,
    phanThuong: number,
    datCuoc: string
    timeoccurs: string,
  }[] = [];

  lichSuThayDoi: {
    idPlayer: number,
    content: string,
    trans: number,
    balance: number,
    timeChangeFormatted: string
  }[] = [];
  selectedTab: 'lichSuCuoc' | 'lichSuThayDoi' = 'lichSuCuoc'; // Tab mặc định là 'lichSuCuoc'



  ngOnInit(): void {
    // this.money = this.userService.getBalanceCookies()

    this.friendService.getListFriends().subscribe(
      (data: any[]) => {
        this.friends = data;
        this.numberFriend = this.friends.length; // Đếm số lượng bạn bè
        console.log('Số lượng bạn bè:', this.numberFriend); // Kiểm tra trong console
        console.log('Danh sách bạn bè:', this.friends); // Kiểm tra trong console
      },
      (error: any) => {
        console.error('Lỗi khi tải danh sách bạn bè:', error);
      }
    );
    this.userService.getAtmUser(this.userService.getCookies()).subscribe(
      (res: any) => {
        this.stk = res.stk;
        this.money = res.balance; // Lưu số dư vào biến money

      }
    );

  }
  addCard() {
    // Tạo tài khoản ATM
    this.atm.CreateAtm(this.userService.getCookies(), this.newStk).subscribe(
      (res: any) => {
        this.toastr.success('Tạo tài khoản ATM thành công!'); // Hiển thị thông báo thành công
        this.stk = this.newStk; // Cập nhật stk mới
        this.showForm = false; // Đóng form sau khi tạo tài khoản thành công
      },
      (err: any) => {
        this.toastr.error('Tạo tài khoản ATM thất bại!'); // Hiển thị thông báo lỗi
      }
    );
    location.reload();
    }

  selectTab(tab: 'lichSuCuoc' | 'lichSuThayDoi') {
    this.selectedTab = tab;
    if (tab === 'lichSuThayDoi') {
      this.userService.getHisBalance(this.userService.getCookies()).subscribe(
        (res: any) => {
          this.lichSuThayDoi = res;
          console.log("Lịch sử thay đổi số dư:", this.lichSuThayDoi);
        },
        (err: any) => {
          console.error('Lỗi khi tải lịch sử thay đổi số dư :', err);
        }
      );
    }
    if (tab === 'lichSuCuoc') {
      this.userService.getPlayerHisAll(this.userService.getCookies()).subscribe(
        (res: any) => {
          this.lichSuCuoc = res.map((item: any) => {
            let parsedDate = null;

            if (item.timeoccurs) {
              const parts = item.timeoccurs.split(/[- :]/); // ["13", "04", "2025", "14", "39", "29"]
              const isoString = `${parts[2]}-${parts[1]}-${parts[0]}T${parts[3]}:${parts[4]}:${parts[5]}`;
              parsedDate = new Date(isoString);
            }

            console.log("Chuỗi ban đầu:", item.timeoccurs);
            console.log("Date object đã chuyển:", parsedDate);
            console.log("Lịch sử cược:", this.lichSuCuoc);

            return {
              namegame: item.nameGame,
              ketQua: item.result,
              soTienCuoc: item.bet,
              phanThuong: item.reward,
              datCuoc: item.choice,
              timeoccurs: parsedDate, // 👈 Date object
            };

          });
        },
        (err: any) => {
          console.error('Lỗi khi tải lịch sử cược:', err);
        }
      );

    }

  }

  isModalOpen = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Mật khẩu mới không khớp');
      return;
    }

    if (this.oldPassword === this.newPassword) {
      alert('Vui lòng đổi mật khẩu mới không trùng mật khẩu cũ');
      return;
    }

    const userId = this.userService.getCookies();

    if (!userId) {
      alert('Không xác định được người dùng');
      return;
    }

    const payload = {
      id: userId,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };
    this.userService.changePassword(Number(userId), this.oldPassword, this.newPassword).subscribe({
      next: (response) => {
        console.log('đổi mk:', response);
        alert('Đổi mk thành công');
        this.closeModal();
      },
      error: (err) => {
        console.error('Error changing password:', err);
        alert('Lỗi đổi mk');
      }
    });
    
  }

}
