import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RconLogComponent } from './rcon-log.component';

describe('RconLogComponent', () => {
  let component: RconLogComponent;
  let fixture: ComponentFixture<RconLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RconLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RconLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
