import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {

  constructor(
    private socket: SocketService,
    private auth: AuthenticationService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.socket.sendMessage( 'getAccount', {} );
  }

  ngOnDestroy(): void {
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

}
