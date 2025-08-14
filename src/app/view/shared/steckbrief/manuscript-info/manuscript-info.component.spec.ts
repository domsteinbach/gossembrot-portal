import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuscriptInfoComponent } from './manuscript-info.component';

describe('ManuscriptInfoComponent', () => {
  let component: ManuscriptInfoComponent;
  let fixture: ComponentFixture<ManuscriptInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManuscriptInfoComponent],
    });
    fixture = TestBed.createComponent(ManuscriptInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
