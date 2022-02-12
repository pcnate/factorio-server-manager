import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { SocketService } from './socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  sidebarCollapsed: boolean;
  title: string;
  mobileQuery: MediaQueryList;
  _mobileQueryListener: any;
  
  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private socket: SocketService,
    public auth: AuthenticationService,
  ) {
    this.sidebarCollapsed = true;
    this.title = 'unr34l factorio server';
    this.mobileQuery = media.matchMedia('(max-with: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener( "change", this._mobileQueryListener );
  }

  /**
   * Called after the constructor, initializing input properties, and the first call to ngOnChanges.
   */
  ngOnInit(): void {

    this.socket.getMessageSubscription().subscribe( event => {
    });
  }

  public toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    console.log({ sidebarCollapsed: this.sidebarCollapsed });
  }
}
