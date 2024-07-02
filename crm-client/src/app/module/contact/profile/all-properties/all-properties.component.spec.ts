import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactAllPropertiesComponent } from './all-properties.component';

describe('SettingComponent', () => {
  let component: ContactAllPropertiesComponent;
  let fixture: ComponentFixture<ContactAllPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactAllPropertiesComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ContactAllPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
