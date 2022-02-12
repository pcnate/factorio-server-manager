import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateBracketComponent } from './date-bracket.component';

describe('DateBracketComponent', () => {
  let component: DateBracketComponent;
  let fixture: ComponentFixture<DateBracketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateBracketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateBracketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
