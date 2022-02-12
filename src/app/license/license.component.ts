import { Component, OnInit } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-license',
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.scss']
})
export class LicenseComponent implements OnInit {
  license: string;

  constructor(
    private socket: SocketService,
  ) {
    this.license = '';
  }

  ngOnInit(): void {
    this.socket.makeRequest( 'getLicense', null ).subscribe( licenseText => {
      this.license = licenseText?.body?.license || '';
    })
  }

}
