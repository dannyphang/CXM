import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCompanyPageComponent } from './contact-company-page.component';

describe('ContactCompanyPageComponent', () => {
  let component: ContactCompanyPageComponent;
  let fixture: ComponentFixture<ContactCompanyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactCompanyPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactCompanyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
