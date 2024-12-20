import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityCreateDialogComponent } from './activity-create-dialog.component';

describe('ActivityCreateDialogComponent', () => {
  let component: ActivityCreateDialogComponent;
  let fixture: ComponentFixture<ActivityCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityCreateDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivityCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
