import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPropertiesComponent } from './all-properties.component';

describe('AllPropertiesComponent', () => {
  let component: AllPropertiesComponent;
  let fixture: ComponentFixture<AllPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPropertiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
