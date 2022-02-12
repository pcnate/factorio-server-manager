import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-game-logs',
  templateUrl: './game-logs.component.html',
  styleUrls: ['./game-logs.component.scss']
})
export class GameLogsComponent implements OnInit, OnDestroy {
  @ViewChild( MatSort,      { static: false } ) sort: MatSort = new MatSort();
  // @ViewChild( MatTable,     { static: false } ) table: MatTable<any>;
  // @ViewChild( MatPaginator, { static: false } ) paginator: MatPaginator;

  // paginationData: Observable<any>;

  sortField: string = '';
  sortDirection: string = '';

  getGameDataSubscription: Subscription;
  newGameDataSubscription: Subscription;

  gameLogs: MatTableDataSource<never>;
  displayedColumns: string[] = [ 'Date', 'Data' ];

  constructor(
    private socket: SocketService,
  ) {
    this.gameLogs = new MatTableDataSource([]);
    this.gameLogs.sort = this.sort;
    this.getGameDataSubscription = this.socket.subscribeMessage( 'listGameData' ).subscribe( ( data: any ) => {
      this.gameLogs = data.body;
      this.getGameDataSubscription.unsubscribe();
      this.sortLogs();
    });
    this.newGameDataSubscription = this.socket.subscribeMessage( 'gameData' ).subscribe( ( data: any ) => {
      this.gameLogs.data.push( <never>data.body );
      this.sortLogs();
    })
  }

  ngOnInit(): void {
    this.socket.sendMessage( 'loadGameData', {} );

    let sortSetting: Sort = {
      active: 'date',
      direction: 'desc'
    }
    // try {
    //   const sortSettingLoad: Sort = JSON.parse( localStorage.getItem( 'game-logs-sort' ) || '' );
    //   if ( sortSettingLoad === null ) {
    //     localStorage.removeItem( 'game-logs-sort' );
    //   } else {
    //     sortSetting = sortSettingLoad;
    //   }
    // } catch ( e ) { }

    // console.log({ sortSetting })

    this.sortField     = sortSetting.active;
    this.sortDirection = sortSetting.direction;
  }

  ngOnDestroy(): void {
    if ( !!this.newGameDataSubscription.unsubscribe ) {
      this.newGameDataSubscription.unsubscribe();
    }
  }

  sortLogs(): void {
    // this.gameLogs = this.gameLogs.sort( ( b, a ) => a.date - b.date );
  }

  trackBy( index: number|null = null, element: any = null ): number {
    if( element?.date && Number( element?.date ) ) {
      return Number( element?.date );
    }

    return index || 0;
  }

}
