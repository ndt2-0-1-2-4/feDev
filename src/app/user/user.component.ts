import { Component } from '@angular/core';
import { userService } from '../service/users.service';
import { FriendService } from '../service/friend.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { error } from 'node:console';
import { NgxPaginationModule } from 'ngx-pagination';
@Component({
  selector: 'app-user',
  imports: [CommonModule, FormsModule ,NgxPaginationModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  changeDetectorRef: any;
  constructor(
    private userService: userService,
    private friendService: FriendService,
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
    this.fullname = this.userService.getNameCookies()
    this.money = this.userService.getBalanceCookies()

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
        console.log("STK:", this.stk);
      },
      (err: any) => {
        console.error('Lỗi khi tải danh sách bạn bè:', err);
      }


    );

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

}
