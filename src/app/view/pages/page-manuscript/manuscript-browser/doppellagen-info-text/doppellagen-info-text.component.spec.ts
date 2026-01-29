import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DoppellagenInfoTextComponent } from "./doppellagen-info-text.component";

describe("DoppellagenInfoTextComponent", () => {
  let component: DoppellagenInfoTextComponent;
  let fixture: ComponentFixture<DoppellagenInfoTextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoppellagenInfoTextComponent],
    });
    fixture = TestBed.createComponent(DoppellagenInfoTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
