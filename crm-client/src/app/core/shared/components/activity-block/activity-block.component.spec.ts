import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityBlockComponent } from './activity-block.component';

describe('ActivityBlockComponent', () => {
  let component: ActivityBlockComponent;
  let fixture: ComponentFixture<ActivityBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityBlockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
