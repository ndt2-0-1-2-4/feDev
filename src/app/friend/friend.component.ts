import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FriendService } from '../service/friend.service';
import { map, forkJoin, lastValueFrom } from 'rxjs';
import { userService } from '../service/users.service';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-friend',
  imports: [CommonModule, FormsModule ],
  templateUrl: './friend.component.html',
  styleUrl: './friend.component.css',
})

export class FriendComponent {
  [x: string]: any;
  showFriendsList = false; // Biến kiểm soát hiển thị danh sách bạn bè
  showFriendRequest = false; // Biến kiểm soát hiển thị danh sách lời mời kết bạn
  searchQuery = ''; // Biến lưu trữ từ khóa tìm kiếm
  showSearchResults = false; // Biến kiểm soát hiển thị kết quả tìm kiếm người kết bạn
  searchResults: { id: number; fullname: string,relative:any }[] = []; // Danh sách kết quả tìm kiếm người kết bạn


  friends: { idFriend: number; name: string }[] = []; // Danh sách bạn bè
  friendRequests : { id: number; name: string }[] = []; // Danh sách lời mời kết bạn
  btn_add = 'Thêm bạn bè';
  apiAddFriend = environment.apiaddFriend;
  sentRequests: number[] = []; // Danh sách ID người đã gửi lời mời

  constructor(private friendService: FriendService , 
    private userService: userService,
    private http: HttpClient,) { }

  ngOnInit() {
    this['loadFriends']();
  }



  loadFriends() {
    this.friendService.getListFriends().subscribe(
      (data: any[]) => {
        this.friends = data; // Lưu cả id và name
        console.log('Danh sách bạn bè:', this.friends); // Kiểm tra trong console
      },
      (error:any) => {
        console.error('Lỗi khi tải danh sách bạn bè:', error);
      }
    );
  }




  showListFriend() {
    this.showFriendsList = true;
    this.showFriendRequest = false; // Ẩn danh sách lời mời kết bạn
  }

  displayFriendRequests(): void {
    this.showFriendsList = false;
    this.showFriendRequest = true;

    const idMy = this.userService.getCookies(); // Lấy ID người dùng hiện tại

    this.friendService.getFriendRequets().subscribe({
        next: (response: any) => {
            if (Array.isArray(response)) {
                this.friendRequests = response.map(item => ({
                    id: item.id,     // ID của người gửi lời mời
                    name: item.name  // Tên của người gửi lời mời
                }));
                console.log("Danh sách lời mời kết bạn:", this.friendRequests);
            } else {
                console.warn("Phản hồi không đúng định dạng:", response);
                alert("Dữ liệu phản hồi không hợp lệ!");
            }
        },
        error: (error: any) => {
            console.error("Lỗi khi lấy danh sách lời mời kết bạn:", error);
            
            if (error.status === 404) {
                alert("Không có lời mời kết bạn nào.");
                this.friendRequests = []; // Đặt danh sách trống
            } else {
                alert("Không thể tải danh sách lời mời kết bạn! Vui lòng thử lại sau.");
            }
        }
    });
}



// tìm kiếm 

searchFriends() {
  this.showFriendsList = false;
  this.showFriendRequest = false;
  this.showSearchResults = true;
  this.searchResults = []
  const query = (this.searchQuery || "").trim(); // Không chuyển đổi về chữ thường
  if (!query) {
      this.searchResults = [];
      return;
  }

  // Tạo biểu thức chính quy để tìm kiếm không phân biệt chữ hoa chữ thường
  const regex = new RegExp(query, 'i'); // 'i' để không phân biệt chữ hoa chữ thường

  this.userService.getFullname(query).subscribe({
      next: (users: any[]) => {

          if (!Array.isArray(users)) {
              console.error("API không trả về danh sách hợp lệ:", users);
              this.searchResults = [];
              return;
          }
          users.forEach(element => {
            this.friendService.getRelativeFr(this.userService.getCookies(),element.id).subscribe(
                (response: any) => {
                    if(response != null){
                        this.searchResults.push({id:element.id,fullname:element.fullname,relative:response.relative})
                    }
                    else{
                        this.searchResults.push({id:element.id,fullname:element.fullname,relative:"Thêm bạn bè"})
                    }
                },
                (error: any) => {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                }
            )
            console.log(element)
          });
          console.log("Danh sách tìm kiếm (có id & fullname):", this.searchResults);
      },
      error: (error: any) => {
          console.error("Lỗi khi tìm kiếm bạn bè:", error);
          this.searchResults = [];
      }
  });
}


  sendMessage(friend: string) {
    alert(`Nhắn tin với ${friend}`);
  }


  async removeFriend(friend: { id: number; name: string }) {
    try {
      // Lấy ID bạn bè từ dịch vụ hoặc từ tham số
      const friendId = friend.id;
  
      // Lấy ID của người dùng hiện tại từ cookie
      const idMy = Number(this.userService.getCookies());
    
      console.log(`🛠 Debug: ID người dùng: ${idMy}, ID bạn bè: ${friendId}`);
      
  
      // Xác nhận trước khi xóa
      const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa ${friend.name}?`);
      if (!confirmDelete) return;
  
      // Gọi API xóa bạn bè
      const result = await lastValueFrom(this.friendService.deleteFriend(idMy, friendId));
  
      if (result.status === 'success') {
        // Xóa khỏi danh sách hiển thị
        this.friends = this.friends.filter(f => f.idFriend !== friendId);
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error('Lỗi khi xóa bạn bè:', error);
      alert('❌ Xóa bạn bè thất bại, vui lòng thử lại');
    }
  }
  
  

  
  // thêm bạn bè
  addFriend(friendId: number) {
    if (!friendId) {
        console.error("Lỗi: ID bạn bè không hợp lệ", friendId);
        alert("Không thể gửi lời mời kết bạn. ID không hợp lệ!");
        return;
    }

    const idMy = this.userService.getCookies(); // Lấy ID người gửi lời mời

    if (!idMy) {
        alert("Bạn cần đăng nhập để gửi lời mời kết bạn!");
        return;
    }

    // Debug dữ liệu trước khi gửi
    console.log("📤 Dữ liệu gửi lên API:", { idMy, idFriend: friendId });

    this.http.post(
        this.apiAddFriend, // API gửi lời mời kết bạn
        { idMy, idFriend: friendId },
    ).subscribe({
        next: (response: any) => {
            console.log("✅ Phản hồi từ API:", response);

            if (response?.success) {
                if (!this.sentRequests.includes(friendId)) {
                    this.sentRequests = [...this.sentRequests,friendId];
                    // this.sentRequests.push(friendId);
                    // UI will update automatically after modifying sentRequests
                }
            } else {
                alert(response?.message || "Gửi lời mời thất bại!");
            }
        },
        error: (error: any) => {
            console.error("❌ Lỗi khi gửi lời mời kết bạn:", error);

            if (error.status === 400) {
                alert("Lỗi 400: Kiểm tra lại dữ liệu gửi lên!");
            } else if (error.status === 403) {
                alert("Lỗi bảo mật: Vui lòng đăng nhập lại!");
                window.location.reload();
            } else {
                alert(error.error?.message || "Có lỗi xảy ra khi gửi lời mời!");
            }
        }
    });
}

acpRequests(request: { id: number; name: string }) {
    const idFriend = request.id; // ID của người gửi lời mời

    if (!idFriend) {
        console.error("ID người gửi không hợp lệ:", idFriend);
        alert("ID người gửi không hợp lệ!");
        return;
    }

    // Giả sử bạn đã lưu ID của người dùng hiện tại trong localStorage hoặc biến khác
    const idMy = Number(this.userService.getCookies()); // Hoặc cách lấy ID khác

    if (!idMy) {
        console.error("Không tìm thấy ID người dùng hiện tại");
        alert("Vui lòng đăng nhập lại!");
        return;
    }

    // Gửi yêu cầu chấp nhận kết bạn
    this.friendService.acceptFriend(idMy, idFriend).subscribe({
        next: (response: any) => {
            console.log("Kết quả chấp nhận:", response);
            this.friendRequests = this.friendRequests.filter(r => r.id !== idFriend);
            alert("Chấp nhận lời mời kết bạn thành công ")
            location.reload()
        },
        error: (error: any) => {
            console.error("Lỗi khi chấp nhận lời mời:", error);
            alert("Chấp nhận lời mời thất bại!");
        }
    });
}
  


deleteFR(request: { id: number; name: string }) {
    const idFriend = Number(this.userService.getCookies());
    const idMy = request.id;

    console.log(` Debug: ID người dùng: ${idMy}, ID bạn bè: ${idFriend}`);

    if (!idMy || isNaN(idMy)) {
        console.error("Lỗi: Không xác định được người dùng.");
        alert("Lỗi: Không xác định được người dùng. Vui lòng đăng nhập lại.");
        return;
    }

    if (!idFriend || isNaN(idFriend)) {
        console.error("Lỗi: ID bạn bè không hợp lệ.");
        alert("Lỗi: ID bạn bè không hợp lệ. Không tìm thấy yêu cầu kết bạn này.");
        return;
    }

    this.friendService.deleteFriendRequests(idMy, idFriend).subscribe({
        next: (response) => {
            console.log("✅ Xóa thành công:", response);
            this.friendRequests = this.friendRequests.filter(r => r.id !== idFriend);
            alert(`Đã xóa yêu cầu từ ${request.name}`);
            this.displayFriendRequests();
        },
        error: (error) => {
            console.error("❌ Lỗi khi xóa:", error);
            if (error.status === 400 && error.error && error.error.message) {
                alert(`Lỗi: ${error.error.message}`); // Hiển thị thông báo lỗi từ API
            } else if (error.status === 404) {
                alert("Lỗi: Không tìm thấy yêu cầu kết bạn.");
            } else {
                alert("Lỗi không xác định. Vui lòng thử lại!");
            }
            // Thêm logging chi tiết để gỡ lỗi
            console.log("Chi tiết lỗi:", error);
        }
    });
  }  
}