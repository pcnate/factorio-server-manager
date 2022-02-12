import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { SocketService } from '../socket.service';

interface GameDetails {
  Label: string;
  Value: any;
}

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss']
})
export class GameDetailsComponent implements OnInit, OnDestroy {
  updateTickSubscription: Subscription;
  tickData: any = {}

  displayedColumns: string[] = [ 'Label', 'Value' ];
  dataSource: MatTableDataSource<GameDetails> = new MatTableDataSource([
    { Label: 'Version',   Value: '' },
    { Label: 'Seed',      Value: '' },
    { Label: 'Time',      Value: '' },
    { Label: 'Evolution', Value: '' },
  ]);

  constructor(
    private socket: SocketService,
  ) {
    this.updateTickSubscription = this.socket.subscribeMessage( 'updateTick' ).subscribe( ( data: any ) => {
      this.tickData = data?.body;

      this.dataSource.data = [
        { Label: 'Version',   Value: data?.body?.version   },
        { Label: 'Seed',      Value: data?.body?.seed      },
        { Label: 'Time',      Value: data?.body?.time      },
        { Label: 'Evolution', Value: data?.body?.evolution },
      ];

    } );
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if ( !!this.updateTickSubscription.unsubscribe ) this.updateTickSubscription.unsubscribe();
  }

  trackBy( index: number | null = null, element: any = null ): string {
    if ( element?.name && element?.name !== '' ) {
      return element?.name;
    }

    return '';
  }

}
