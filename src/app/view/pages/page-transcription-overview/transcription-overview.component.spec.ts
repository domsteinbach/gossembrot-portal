import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TranscriptionOverviewComponent } from "./transcription-overview.component";

describe("TranscriptionOverviewComponent", () => {
  let component: TranscriptionOverviewComponent;
  let fixture: ComponentFixture<TranscriptionOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TranscriptionOverviewComponent],
    });
    fixture = TestBed.createComponent(TranscriptionOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
