import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiddlePanelComponent } from './middle-panel.component';

describe('MiddlePanelComponent', () => {
  let component: MiddlePanelComponent;
  let fixture: ComponentFixture<MiddlePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiddlePanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiddlePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
