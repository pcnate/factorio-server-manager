import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() sidebarCollapsed: boolean;

  constructor(
    public auth: AuthenticationService,
  ) {
    this.sidebarCollapsed = true;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
