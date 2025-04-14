import { Component, ViewChild, ElementRef,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Renderer2 } from '@angular/core';
import { FriendService } from '../../service/friend.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-rightside',
  imports: [CommonModule, FormsModule],
  templateUrl: './rightside.component.html',
  styleUrl: './rightside.component.css'
})

export class RightsideComponent implements OnInit {
  constructor(
    private friendService: FriendService,
    private router: Router,
  ){}
  // @ViewChild('tooltip') tooltip!: ElementRef;
  // tooltipVisible = false;
  // tooltipX = 0;
  // tooltipY = 0;
  // tooltipData: { name: string, status: string } | null = null;

  // showTooltip(event: MouseEvent, friend: { name: string, status: string }) {
  //   const rect = (event.target as HTMLElement).getBoundingClientRect();
    
  //   this.tooltipX = rect.left - 160; // Hiển thị bên trái icon
  //   this.tooltipY = rect.top + window.scrollY;
    
  //   this.tooltipData = friend;
  //   this.tooltipVisible = true;
  // }

  // hideTooltip() {
  //   this.tooltipVisible = false;
  // }

//   tooltipVisible = false;
//   tooltipText = '';
//   tooltipStyle = {};

//   constructor(private renderer: Renderer2) {}

//   showTooltip(element: HTMLElement, text: string) {
//     this.tooltipVisible = true;
//     this.tooltipText = text;
 
//     const rect = element.getBoundingClientRect();
//     const sidebarWidth = document.querySelector('.sidebar-right')?.clientWidth || 0;
 
//     this.tooltipStyle = {
//       top: `${rect.top + window.scrollY}px`,
//       left: `${rect.left - sidebarWidth - 10}px`, // Điều chỉnh khoảng cách
//     };
//  }
 
//  hideTooltip() {
//     this.tooltipVisible = false;
//  }
  iconPath= "M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"
  status="online"
  friends=[{name:''}] 

  groups = [
    { iconPath: "M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" ,status: "online"},
    { iconPath: "M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" ,status: "online"},
    { iconPath: "M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" ,status: "online"},
    { iconPath: "M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" ,status: "online"},
    { iconPath: "M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" ,status: "online"}
  ];
  ngOnInit(): void {
      this.friendService.getListFriends().subscribe(
        (data:any)=>{
          this.friends = data;
        },
        (error:any)=>{
          console.log(error);
        }
      )
  }
  friend(){
    this.router.navigate(["/friend"])
  }
}
