import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../service/socket.service';
import { userService } from '../service/users.service';
import { environment } from '../../environments/environment';
import { FriendService } from '../service/friend.service';
import { MessageService } from '../service/message.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-message',
  imports: [CommonModule, FormsModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
  constructor(
    private socketService: WebSocketService,
    private userService: userService,
    private friendService: FriendService,
    private messageService: MessageService,
    private router: Router,
  ){}
  urlSocketMess=environment.urlSocketMess
  users: any[] = [];
  selectedUser: { id: number; fullname: string } | null = null;
  newMessage: string = '';

  chatHistory: { [idFriend: number]: { idMy:number;content: string }[] } = {
  };

  messages: { content: string; type: string }[] = [];

  selectUser(user: { id: number; fullname: string }) {
    this.selectedUser = user;
    // this.messages = this.chatHistory[user.id] || [];
    const idMy = parseInt(this.userService.getCookies());
    this.messageService.getChatHis(parseInt(this.userService.getCookies()),this.selectedUser.id).subscribe(
      (data:any)=>{
        this.messages = data.map((msg: { idFriend: number; content: string; type: string }) => ({
          content: msg.content,
          type: msg.idFriend === idMy ? "received" : "sent" ,
          id:msg.idFriend
        }));
        console.log(this.messages)
      },
      (error:any)=>{
        console.log(error)
      }
    )
  }
  displayMsg(msg:any,type:any){
    console.log(msg,msg.content)
    if (type === 'sent' || type === 'received') {
      this.messages.unshift({
        content: msg,
        type: type,
      });
      
    }
  }
  get reversedmessages() {
    return this.messages.slice().reverse();
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedUser) {
      const newMsg = { text: this.newMessage, type: 'sent' };
      
      let data={
        "type":"message",
        "idReceiver":this.selectedUser.id,
        "content":this.newMessage
      }
      let jsonData=JSON.stringify(data)
      this.socketService.sendMessage(this.urlSocketMess,jsonData)
      this.displayMsg(newMsg.text,'sent')
      this.newMessage = '';
    }
  }

  //be
  ngOnInit(): void {
    this.friendService.getListFriends().subscribe(
      (data:any[])=>{
        console.log("Friend list data:", data);
        this.users=data
      },
      (error:any)=>{
        console.error("Error fetching friends:", error);
        console.log(error)
      }
    )
    this.urlSocketMess +='?id=' +this.userService.getCookies()
    this.socketService.connect(this.urlSocketMess);
    this.socketService.getMessages().subscribe((message: any) => {
      this.displayMsg(message.message,'received')
    }
    );
  }

  user(){
    this.router.navigate(["/user"])
  }
}
