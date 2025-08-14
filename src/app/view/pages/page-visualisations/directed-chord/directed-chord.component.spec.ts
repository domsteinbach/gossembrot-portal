import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectedChordComponent } from './directed-chord.component';

describe('DirectedChordComponent', () => {
  let component: DirectedChordComponent;
  let fixture: ComponentFixture<DirectedChordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DirectedChordComponent]
    });
    fixture = TestBed.createComponent(DirectedChordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
