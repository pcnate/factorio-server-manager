import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { map, Observable, shareReplay, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';
import { Guid } from 'guid-typescript';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-server-settings',
  templateUrl: './server-settings.component.html',
  styleUrls: ['./server-settings.component.scss']
})
export class ServerSettingsComponent implements OnInit, OnDestroy {
  @ViewChild('input') commandInput!: ElementRef;

  getSettingsSubscription: Subscription;
  updateTickSubscription?: Subscription;
  serverStartedSubscription?: Subscription;
  serverStoppedSubscription?: Subscription;

  status: string;
  serverRunning: boolean;
  rconConnected: boolean;
  onlineUserCount: number;
  command: string;
  commands: string[] = [];
  commandsIndex: number = this.commands.length;

  $cols: Observable<number>;
  
  constructor(
    private socket: SocketService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.command = '';
    this.status = 'Stopped';
    this.serverRunning = false;
    this.rconConnected = false;
    this.onlineUserCount = 0;

    try {
      let x = JSON.parse( localStorage.getItem( 'rcon-history' ) || '[]' );
      if ( !!x ) this.commands = x;
      this.commandsIndex = this.commands.length
    } catch( error ) {
      console.error( 'Error parsing rcon-history', error );
    }

    this.$cols = this.breakpointObserver
      .observe( [ Breakpoints.XSmall ] )
      .pipe(
        map( ( result: BreakpointState ) => {
          if ( result.breakpoints[ Breakpoints.XSmall ] ) {
            return 1;
          } else {
            return 2;
          }
        } ),
        shareReplay(),
      )

    this.getSettingsSubscription = this.socket.subscribeMessage( 'updateSettings' ).subscribe( ( data: any ) => {
      this.serverRunning = !!data?.body?.serverRunning;
      this.status = this.serverRunning ? 'Running' : 'Stopped';
      this.getSettingsSubscription.unsubscribe();

      this.updateTickSubscription = this.socket.subscribeMessage( 'updateTick' ).subscribe( ( data: any ) => {
        this.serverRunning = data?.body?.serverRunning || false;
        this.rconConnected = data?.body?.rconConnected || false;
        this.onlineUserCount = data?.body?.onlineUserCount || 0;
      } );

      this.serverStartedSubscription = this.socket.subscribeMessage( 'serverStarted' ).subscribe( ( data: any ) => {
        this.serverRunning = true;
        this.status = 'Running';
      } );
      this.serverStoppedSubscription = this.socket.subscribeMessage( 'serverStopped' ).subscribe( ( data: any ) => {
        this.serverRunning = false;
        this.status = 'Stopped';
      } );

    });
  }
  
  ngOnInit(): void {
    this.socket.sendMessage( 'getSettings', {} );
  }
  
  ngOnDestroy(): void {
    if ( !!this?.updateTickSubscription?.unsubscribe ) this.updateTickSubscription.unsubscribe();
    if ( !!this?.serverStartedSubscription?.unsubscribe ) this.serverStartedSubscription.unsubscribe();
    if ( !!this?.serverStoppedSubscription?.unsubscribe ) this.serverStoppedSubscription.unsubscribe();
  }

  start(): void {
    this.socket.sendMessage( 'startServer', {} );
  }

  stop(): void {
    this.socket.sendMessage( 'stopServer', {} );
  }

  toggle(): void {
    if ( this.serverRunning ) {
      this.status = 'Stopping';
      this.stop();
    } else {
      this.status = 'Starting';
      this.start();
    }
  }

  sendCommand(): void {
    let command = this.command;
    if ( !command || command === '' ) {
      return;
    }

    if ( this.commands?.[ this.commands.length-1 ] !== this.command ) {
      this.commands.push( this.command );
      localStorage.setItem( 'rcon-history', JSON.stringify( this.commands ) );
    }
    this.commandsIndex = this.commands.length;
    this.command = '';
    this.socket.sendMessage( 'sendRconCommand', { command, id: Guid.create().toString() } );
    this.commandInput.nativeElement.focus();
  }

  checkSubmit( event: KeyboardEvent ) {
    if ( event?.key === 'Enter' ) {
      this.sendCommand();
    }
  }

  history( direction: string|null = null ) {
    if ( !direction ) return;
    let startIndex = this.commandsIndex;
    let index = this.commandsIndex;

    if ( direction === 'up' && index > 0 ) index--;
    else if ( direction === 'down' && index <= this.commands.length ) index++;
    else return;

    // allow going past to clear the field
    if ( index === this.commands.length ) {
      this.command = '';
      this.commandsIndex = this.commands.length;
      return;
    }

    // change to the correct history location
    if ( !!this.commands?.[ index ] && index !== startIndex ) {
      this.commandsIndex = index;
      this.command = this.commands?.[ index ];
    }

  }

}
