import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageVisualisationsComponent } from './page-visualisations.component';

describe('PageVisualisationsComponent', () => {
  let component: PageVisualisationsComponent;
  let fixture: ComponentFixture<PageVisualisationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageVisualisationsComponent]
    });
    fixture = TestBed.createComponent(PageVisualisationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
