import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../socket.service';

interface Command {
  time: number;
  uid: string;
  command: string;
  response: string;
}

@Component({
  selector: 'app-rcon-log',
  templateUrl: './rcon-log.component.html',
  styleUrls: ['./rcon-log.component.scss']
})
export class RconLogComponent implements OnInit, OnDestroy {
  receivedCommandSubscription: Subscription;
  
  commandHistory: Command[] = [];

  constructor(
    private socket: SocketService,
  ) {
    this.commandHistory = [];
    this.receivedCommandSubscription = this.socket.subscribeMessage( 'receivedRconCommand' ).subscribe( ( data: any ) => {
      if( data?.body ) {
        this.commandHistory.push( data.body );
      }
    } );
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if ( !!this?.receivedCommandSubscription?.unsubscribe ) this.receivedCommandSubscription.unsubscribe();
  }

}
