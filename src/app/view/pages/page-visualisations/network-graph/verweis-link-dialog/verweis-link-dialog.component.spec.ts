import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VerweisLinkDialogComponent } from "./verweis-link-dialog.component";

describe("VerweisLinkDialogComponent", () => {
  let component: VerweisLinkDialogComponent;
  let fixture: ComponentFixture<VerweisLinkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerweisLinkDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VerweisLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
