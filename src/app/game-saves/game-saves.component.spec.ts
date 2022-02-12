import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSavesComponent } from './game-saves.component';

describe('GameSavesComponent', () => {
  let component: GameSavesComponent;
  let fixture: ComponentFixture<GameSavesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameSavesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameSavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
