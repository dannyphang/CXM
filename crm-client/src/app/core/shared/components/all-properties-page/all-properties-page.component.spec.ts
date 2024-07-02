import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPropertiesPageComponent } from './all-properties-page.component';

describe('SettingPageComponent', () => {
  let component: AllPropertiesPageComponent;
  let fixture: ComponentFixture<AllPropertiesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPropertiesPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AllPropertiesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
