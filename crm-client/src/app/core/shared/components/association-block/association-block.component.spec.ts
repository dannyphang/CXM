import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationBlockComponent } from './association-block.component';

describe('AssociationBlockComponent', () => {
  let component: AssociationBlockComponent;
  let fixture: ComponentFixture<AssociationBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociationBlockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssociationBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
