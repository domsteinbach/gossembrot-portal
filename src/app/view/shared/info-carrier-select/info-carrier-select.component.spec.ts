import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InfoCarrierSelectComponent } from "./info-carrier-select.component";

describe("InfoCarrierSelectComponent", () => {
  let component: InfoCarrierSelectComponent;
  let fixture: ComponentFixture<InfoCarrierSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoCarrierSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoCarrierSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
