import { Injectable } from '@angular/core';
import { Subject, Observable, Subscription, first } from 'rxjs';
import { io } from 'socket.io-client';
import { QueuedMessage, Subjects } from './shared';
import { Guid } from 'guid-typescript';

export class SocketService {
  private url: string;
  private socket;
  private pid: number|null;
  private connected: boolean;
  private messageQueue: QueuedMessage[];

  private socketSubject: Subject<any>;

  private subjects: Subjects;

  /**
   * construct the class
   */
  constructor() {
    this.pid = null;
    this.connected = false;
    this.socketSubject = new Subject();
    this.url = '';
    this.socket = io( this.url );
    this.messageQueue = [];
    this.subjects = {};

    this.socket.on('connect',    () => this.checkConnection()  );
    this.socket.on('disconnect', () => this.connected = false );
    
    this.listenForDevServerReload();
  }

  private checkConnection() {
    this.connected = true;
    for( let message of this.messageQueue ) {
      this.socket.emit( message.message, message.body );
      message.sent = true;
    }
    this.messageQueue = this.messageQueue.filter( x => x.sent === false );
  }

  /**
   * send unstructured messages to the server
   */
  public sendMessage( message: string, body: any ) {
    if ( this.connected ) {
      this.socket.emit( message, body );
    } else {
      this.messageQueue.push({ message, body, sent: false })
    }
  }

  public makeRequest( message: string, body: any ): Observable<any> {
    return new Observable( observer => {
    
      let guid = Guid.create().toString();
      let responded = false;
      this.sendMessage( message, Object.assign( { responseMessage: guid }, body ) );

      this.subscribeMessage( guid ).pipe( first() ).subscribe( response => {
        responded = true;
        observer.next({ message, guid, body: response?.body || response });
      } );

      setTimeout( () => {
        if ( !responded ) observer.next({ message: message+'_timed_out', body });
      }, 90 * 1000 );

    }).pipe( first() );
  }

  /**
   * subscribes to a message
   * 
   * @param message message type
   * @param callback function to run when the message is received
   * @returns a subscribable object
   */
  public subscribeMessage( message: string ): Subject<any> {
    if ( !this.subjects[ message ] ) {
      this.subjects[ message ] = new Subject();
    }
    return this.subjects[ message ];
  }

  /**
   * get an observaable of all messages
   */
  public getMessageSubscription = () => {
    return new Observable( ( subject: any ) => {
      this.socket.onAny( ( message: string, body: any ) => {
        if ( !!this.subjects[ message ] ) {
          this.subjects[ message ].next({ message, body })
        }
        subject.next({ message, body });
      });
    });
  }

  /**
   * replacement for reloadjs when the server is running in dev mode
   */
  private listenForDevServerReload(): void {
    this.socket.on('process_id', pid => {
      if ( this.pid === null ) {
        this.pid = Number( pid );
        return;
      }
      if ( this.pid !== Number( pid ) ) {
        console.log( 'server restarted, reloading...' );
        window.location.reload();
      }
    });
  }

}
