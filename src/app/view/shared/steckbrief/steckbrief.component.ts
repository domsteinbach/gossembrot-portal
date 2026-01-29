import { Component, Input } from "@angular/core";
import { InformationCarrier } from "../../../model/infoCarrier";
import { MatExpansionPanel } from "@angular/material/expansion";
import { LocalStorageService } from "../../../service/local-storage.service";

export interface NullCarrier {
  title: string;
  subTitle: string;
  description: string;
}

@Component({
  selector: "app-steckbrief",
  templateUrl: "./steckbrief.component.html",
  styleUrls: ["./steckbrief.component.scss"],
})
export class SteckbriefComponent {
  @Input() selectedCarrier?: InformationCarrier | null;
  @Input() nullCarrier?: NullCarrier;

  steckbriefPanelOpenState = true;

  get hasContent(): boolean {
    if (this.selectedCarrier == null && this.nullCarrier) {
      return false;
    } else {
      return (
        !!this.selectedCarrier?.namingsGossembrot?.length ||
        !!this.selectedCarrier?.matDescription ||
        (this.selectedCarrier?.physicality === "Available" &&
          !!this.selectedCarrier?.description)
      );
    }
  }

  constructor(private _localStorage: LocalStorageService) {
    if (this._localStorage.steckbriefPanelExpanded != null) {
      this.steckbriefPanelOpenState =
        this._localStorage.steckbriefPanelExpanded;
    } else {
      this._localStorage.steckbriefPanelExpanded = true;
    }
  }

  toggleSteckbriefPanel(event: MouseEvent, panel: MatExpansionPanel): void {
    this.steckbriefPanelOpenState = !this.steckbriefPanelOpenState;
    event.stopPropagation();
    panel.toggle();
    this._localStorage.steckbriefPanelExpanded = this.steckbriefPanelOpenState;
  }
}
