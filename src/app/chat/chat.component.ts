import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Chat, OnlineUserCount } from '../shared';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  chatListSubscription: Subscription;
  newChatSubscription: Subscription;
  onlineUserCountSubscription: Subscription;
  chats: Chat[] = [];
  onlineUserCount: number;
  showUsers: boolean;

  constructor(
    private socket: SocketService,
  ) {
    this.onlineUserCount = 0;
    this.showUsers = true;
    this.chatListSubscription = this.socket.subscribeMessage( 'chatsList' ).subscribe( chats => {
      this.chats = [ ...this.chats, ...chats.body ];
      this.chatListSubscription.unsubscribe();
      this.sortChatsAndSlice();
    });
    this.newChatSubscription = this.socket.subscribeMessage( 'newChat' ).subscribe( chat => {
      this.chats.push( chat.body );
      this.sortChatsAndSlice();
    });
    this.onlineUserCountSubscription = this.socket.subscribeMessage( 'onlineUserCount' ).subscribe( ( count: OnlineUserCount ) => {
      this.onlineUserCount = count.body;
    });
  }

  ngOnInit(): void {
    this.socket.sendMessage( 'getChats', {} );
    this.socket.sendMessage( 'getOnlineUserCount', {} );
  }

  ngOnDestroy(): void {
    if ( !!this.newChatSubscription.unsubscribe ) {
      this.newChatSubscription.unsubscribe();
    }
    if ( !!this.onlineUserCountSubscription.unsubscribe ) {
      this.onlineUserCountSubscription.unsubscribe();
    }
  }

  sortChatsAndSlice(): void {
    this.chats = this.chats.sort( ( a, b ) => a.date - b.date ).slice( -38 );
  }

  toggleUsers(): void {
    this.showUsers = !this.showUsers;
  }

}
