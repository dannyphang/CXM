import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BingoListComponent } from './bingo-list.component';

describe('BingoListComponent', () => {
  let component: BingoListComponent;
  let fixture: ComponentFixture<BingoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BingoListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BingoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
