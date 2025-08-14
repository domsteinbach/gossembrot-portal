import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeiRenderComponentComponent } from './tei-render-component.component';

describe('TeiRenderComponentComponent', () => {
  let component: TeiRenderComponentComponent;
  let fixture: ComponentFixture<TeiRenderComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeiRenderComponentComponent],
    });
    fixture = TestBed.createComponent(TeiRenderComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
