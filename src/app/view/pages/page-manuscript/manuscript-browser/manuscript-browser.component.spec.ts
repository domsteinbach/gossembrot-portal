import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManuscriptBrowserComponent } from "./manuscript-browser.component";

describe("ManuscriptBrowserComponent", () => {
  let component: ManuscriptBrowserComponent;
  let fixture: ComponentFixture<ManuscriptBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManuscriptBrowserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManuscriptBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
