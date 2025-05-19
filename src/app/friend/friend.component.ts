import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FriendService } from '../service/friend.service';
import { userService } from '../service/users.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { relative } from 'node:path';
import { title } from 'node:process';
import { text } from 'node:stream/consumers';
@Component({
    selector: 'app-friend',
    imports: [CommonModule, FormsModule],
    templateUrl: './friend.component.html',
    styleUrl: './friend.component.css',
})

export class FriendComponent {
    [x: string]: any;
    showFriendsList = false; // Biến kiểm soát hiển thị danh sách bạn bè
    showFriendRequest = false; // Biến kiểm soát hiển thị danh sách lời mời kết bạn
    searchQuery = ''; // Biến lưu trữ từ khóa tìm kiếm
    showSearchResults = false; // Biến kiểm soát hiển thị kết quả tìm kiếm người kết bạn
    searchResults: { id: number; fullname: string, relative: any }[] = []; // Danh sách kết quả tìm kiếm người kết bạn

    isLoading = false;


    friends: {
        id: number; fullname: string,relative:string
    }[] = []; // Danh sách bạn bè
    friendRequests: { id: number; fullname: string , relative:string }[] = []; // Danh sách lời mời kết bạn
    apiAddFriend = environment.apiaddFriend;

    constructor(private friendService: FriendService,
        private userService: userService,
        private http: HttpClient,
        private toastr : ToastrService
    ) { }

    ngOnInit() {

    }
    onSearchChange(): void {
        // Lưu giá trị mỗi lần người dùng thay đổi input
        localStorage.setItem('searchName', this.searchQuery);
    }
    showListFriend() {
        this.showFriendsList=true;
        this.showFriendRequest=false
        this.showSearchResults=false
        this.friendService.getListFriends().subscribe(
            (data:any)=>{
                this.friends=data
            }
        )
    }

    displayFriendRequests(): void {
        this.showFriendsList = false;
        this.showFriendRequest = true;

        const idMy = this.userService.getCookies(); // Lấy ID người dùng hiện tại

        this.friendService.getFriendRequets().subscribe(      
            (data:any)=>{
                if(data.error== null){
                    this.friendRequests=data
                }
                else{
                    this.toastr.info("Bạn không có lời mời kết bạn nào ","Hệ thống")
                }
            }
        )      
    }
    // tìm kiếm 

    searchFriends() {
        this.showFriendsList = false;
        this.showFriendRequest = false;
        this.showSearchResults = true;
        this.searchResults = []
        this.isLoading = true;
        this.userService.getFullname(this.searchQuery).subscribe(
            (data:any)=>{
                console.log(data)
                this.searchResults=data
                this.isLoading=false
            }
        );
        console.log(this.searchQuery)
        this.searchQuery=''
    }


    sendMessage(friend: string) {
        alert(`Nhắn tin với ${friend}`);
    }

    removeFriend(friend: { id: number; fullname: string,relative:string }) {
        Swal.fire({
            title: 'Xác nhận',
            text: 'Bạn có chắc chắn muốn xóa bạn bè này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            heightAuto: false
          }).then((result) => {
            if (result.isConfirmed) {
              this.friendService.deleteFriend(friend.id,Number(this.userService.getCookies())).subscribe({
                  next: (response: any) => {
                    if (response.status === 'success') {
                      this.toastr.success('Đã xóa bạn bè');
                      friend.relative="Đã xoá"
                    } else {
                      this.toastr.error('Lỗi khi xóa bạn bè');
                    }
                  },
                  error: () => this.toastr.error('Lỗi khi gọi API')
                });
            } else {
              this.toastr.info('Hủy xóa bạn bè');
            }
          });
    }
    // thêm bạn bè
    addFriend(result:{id:number,fullname:string,relative:string}) {
        Swal.fire({
            title:"Xác nhận",
            text:"Bạn có muốn gửi lời mời kết bạn",
            icon:'question',
            showCancelButton:true,
            showConfirmButton:true,
            cancelButtonText:"Huỷ",
            confirmButtonText:"Xác nhận",
            heightAuto:false
        }).then((rs)=>{
            if(rs.isConfirmed){
                
                this.friendService.addFriend(result.id).subscribe(
                    (data:any)=>{
                        if(data.status==="success"){
                            this.toastr.success("Đã gửi lời mời","Hệ thống")
                            result.relative='Đã gửi Lời mời'
                        }
                    }
                )
            }
        })
    }

    acpRequests(request: { id: number; fullname: string,relative:string }) {
        const idMy=Number(this.userService.getCookies());
        Swal.fire({
            title:"Xác nhận",
            text:"Bạn có muốn chấp nhận lời mời kết bạn này ?",
            icon:'warning',
            showCancelButton:true,
            showConfirmButton:true,
            cancelButtonText: 'Hủy',
            confirmButtonText:"Xác nhận",
            heightAuto:false
        }).then((result)=>{
            if(result.isConfirmed){
                this.friendService.acceptFriend(idMy, request.id).subscribe(
                    (data:any)=>{
                        if(data.status === "success"){
                            this.toastr.success("Thành công ", "Hệ thống")
                            request.relative="Đã chấp nhận lời mời kết bạn"
                        }
                    },
                    (e)=>{
                        console.log(e)
                    }
                )
            }
        });

    }

    deleteRequest(request: { id: number; fullname: string,relative:string }) {
        const idFriend = Number(this.userService.getCookies());
        Swal.fire({
            title:"Xác nhận",
            text:"Bạn có chắc chắn muốn xoá lời mời kết bạn này ?",
            icon:'warning',
            showCancelButton:true,
            showConfirmButton:true,
            cancelButtonText: 'Hủy',
            confirmButtonText:"Xác nhận",
            heightAuto:false
        }).then((result)=>{
            if(result.isConfirmed){
                this.friendService.deleteFriendRequests(request.id,idFriend).subscribe(
                    (data:any)=>{
                        if(data.relative === "success"){
                            this.toastr.success("Thành công ", "Hệ thống")
                            request.relative="Đã Xoá lời mời kết bạn"
                        }
                    }
                )
            }
        });
    }
    displayRelative(rs:{id:number, fullname:string,relative:string}){
        const validStates = ['Thêm bạn bè', 'Bạn bè', 'Đã gửi'];
        if (!rs.relative || validStates.includes(rs.relative)) {
          return '';
        }
        else{
            return rs.relative;
        }
    }
}