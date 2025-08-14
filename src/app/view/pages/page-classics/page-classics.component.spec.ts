import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageClassicsComponent } from './page-classics.component';

describe('PageClassicsComponent', () => {
  let component: PageClassicsComponent;
  let fixture: ComponentFixture<PageClassicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageClassicsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PageClassicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
