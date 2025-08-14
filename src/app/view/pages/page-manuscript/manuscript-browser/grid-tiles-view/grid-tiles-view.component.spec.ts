import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridTilesViewComponent } from './grid-tiles-view.component';

describe('GridTilesViewComponent', () => {
  let component: GridTilesViewComponent;
  let fixture: ComponentFixture<GridTilesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridTilesViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GridTilesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
