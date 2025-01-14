import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabPanelPageComponent } from './tab-panel-page.component';

describe('TabPanelPageComponent', () => {
  let component: TabPanelPageComponent;
  let fixture: ComponentFixture<TabPanelPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabPanelPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabPanelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
