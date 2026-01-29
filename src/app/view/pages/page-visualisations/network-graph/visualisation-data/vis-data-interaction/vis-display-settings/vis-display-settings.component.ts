import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  MatRadioButton,
  MatRadioChange,
  MatRadioGroup,
} from "@angular/material/radio";
import { MatTooltip } from "@angular/material/tooltip";
import {
  Granularity,
  VisualisationSettingsService,
} from "../../../visualisation-settings.service";
import { Subscription } from "rxjs";
import { AuthService } from "../../../../../../../auth/auth.service";

@Component({
  selector: "app-vis-display-settings",
  standalone: true,
  imports: [MatRadioButton, MatRadioGroup, MatTooltip],
  templateUrl: "./vis-display-settings.component.html",
  styleUrl: "./vis-display-settings.component.scss",
})
export class VisDisplaySettingsComponent implements OnInit, OnDestroy {
  private _granularitySub = new Subscription();
  protected granularity!: Granularity;

  constructor(
    protected authService: AuthService,
    private _visSettings: VisualisationSettingsService,
  ) {}

  ngOnInit(): void {
    this._granularitySub = this._visSettings.granularity$.subscribe((g) => {
      this.granularity = g;
    });
  }

  onGranularityChange(event: MatRadioChange) {
    this._visSettings.granularity = event.value;
  }

  ngOnDestroy() {
    this._granularitySub.unsubscribe();
  }
}
