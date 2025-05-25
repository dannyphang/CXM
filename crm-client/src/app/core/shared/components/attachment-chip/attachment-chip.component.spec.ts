import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentChipComponent } from './attachment-chip.component';

describe('AttachmentChipComponent', () => {
  let component: AttachmentChipComponent;
  let fixture: ComponentFixture<AttachmentChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentChipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AttachmentChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
