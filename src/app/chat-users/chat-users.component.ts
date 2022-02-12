import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { User, UserJoin, UserLeft, UsersList } from '../shared';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-chat-users',
  templateUrl: './chat-users.component.html',
  styleUrls: ['./chat-users.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatUsersComponent implements OnInit {
  userJoinSubscription: Subscription;
  userLeftSubscription: Subscription;
  userListSubscription: Subscription;
  users: User[];

  constructor(
    private socket: SocketService,
  ) {
    this.users = [];
    this.userListSubscription = this.socket.subscribeMessage( 'usersList' ).subscribe( ( users: UsersList ) => {
      this.users = users.body;
      this.sortUsers();
    });
    this.userJoinSubscription = this.socket.subscribeMessage( 'userJoin' ).subscribe( ( user: UserJoin ) => {
      // this.users.push( user.body.user );
      // this.sortUsers();
    });
    this.userLeftSubscription = this.socket.subscribeMessage( 'userLeft' ).subscribe( ( user: UserLeft ) => {
      // this.users = this.users.filter( x => x.user !== user.body.user.user )
      // this.sortUsers();
    });
  }
  
  ngOnInit(): void {
    this.socket.sendMessage( 'getUsers', {} );
  }
  
  ngOnDestroy(): void {
    if ( !!this.userJoinSubscription.unsubscribe ) this.userJoinSubscription.unsubscribe();
    if ( !!this.userLeftSubscription.unsubscribe ) this.userLeftSubscription.unsubscribe();
    if ( !!this.userListSubscription.unsubscribe ) this.userListSubscription.unsubscribe();
  }
  
  sortUsers(): void {
    this.users = this.users.sort( ( a, b ) => a.joined - b.joined )
  }


}
