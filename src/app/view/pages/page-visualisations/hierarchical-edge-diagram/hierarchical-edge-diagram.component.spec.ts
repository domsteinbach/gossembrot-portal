import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchicalEdgeDiagramComponent } from './hierarchical-edge-diagram.component';

describe('HierarchicalEdgeDiagramComponent', () => {
  let component: HierarchicalEdgeDiagramComponent;
  let fixture: ComponentFixture<HierarchicalEdgeDiagramComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HierarchicalEdgeDiagramComponent]
    });
    fixture = TestBed.createComponent(HierarchicalEdgeDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
