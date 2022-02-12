import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

const SAVES: any[] = [
  { date: ( new Date() ).getTime(), name: '20220104.zip',   size: 2.4 * 1024 * 1024 },
  { date: ( new Date() ).getTime(), name: '20220110.zip',   size: 4.9 * 1024 * 1024 },
  { date: ( new Date() ).getTime(), name: '_autosave1.zip', size: 5.0 * 1024 * 1024 },
  { date: ( new Date() ).getTime(), name: '_autosave2.zip', size: 5.1 * 1024 * 1024 },
  { date: ( new Date() ).getTime(), name: '_autosave3.zip', size: 5.2 * 1024 * 1024 },
  { date: ( new Date() ).getTime(), name: '_autosave4.zip', size: 5.3 * 1024 * 1024 },
  { date: ( new Date() ).getTime(), name: '_autosave5.zip', size: 5.4 * 1024 * 1024 },
];

@Component({
  selector: 'app-game-saves',
  templateUrl: './game-saves.component.html',
  styleUrls: ['./game-saves.component.scss']
})
export class GameSavesComponent implements OnInit {

  dataSource = new MatTableDataSource( SAVES );

  displayedColumns: string[] = [ 'date', 'name', 'size', 'download' ];

  constructor() { }

  ngOnInit(): void {
  }

}
