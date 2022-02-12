import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-date-bracket',
  templateUrl: './date-bracket.component.html',
  styleUrls: ['./date-bracket.component.scss']
})
export class DateBracketComponent {
  formattedDate: string;
  @Input()
    set date( date: number ) {
      let _date = new Date( date )
    this.formattedDate = `${_date.getHours().toString().padStart( 2, '0' )}:${_date.getMinutes().toString().padStart( 2, '0' )}:${_date.getSeconds().toString().padStart( 2, '0' ) }`;
    }

  constructor() {
    this.formattedDate = '';
  }

}
