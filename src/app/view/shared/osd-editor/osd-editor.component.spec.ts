import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdEditorComponent } from './osd-editor.component';

describe('OsdViewerComponent', () => {
  let component: OsdEditorComponent;
  let fixture: ComponentFixture<OsdEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OsdEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OsdEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
