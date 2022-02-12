import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { map, pipe, Observable, shareReplay, Subscription, tap } from 'rxjs';
import { OnlineUserCount } from '../shared';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent implements OnInit, OnDestroy {
  onlineUserCount: number;
  onlineUserCountSubscription: Subscription;

  $cols: Observable<number>;
  minCols: number = 1;
  
  constructor(
    private socket: SocketService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.onlineUserCount = 0;

    this.onlineUserCountSubscription = this.socket.subscribeMessage( 'onlineUserCount' ).subscribe( ( count: OnlineUserCount ) => {
      this.onlineUserCount = count.body;
    } );

    this.$cols = this.breakpointObserver
      .observe([ Breakpoints.Large, Breakpoints.Medium, Breakpoints.Small, Breakpoints.XSmall ])
      .pipe(
        map( ( result: BreakpointState ) => {
          if ( result.breakpoints[ Breakpoints.XSmall ]) {
            this.minCols = 1;
            return 1;
          } else if ( result.breakpoints[ Breakpoints.Small ]) {
            this.minCols = 2;
            return 2;
          } else if ( result.breakpoints[ Breakpoints.Medium ] || result.breakpoints[ Breakpoints.Large ]) {
            this.minCols = 3;
            return 3;
          } else {
            this.minCols = 4;
            return 4;
          }
        }),
        shareReplay(),
      )
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if ( !!this.onlineUserCountSubscription.unsubscribe ) this.onlineUserCountSubscription.unsubscribe();
  }

}
