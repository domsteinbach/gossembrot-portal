import { Component, OnDestroy, ViewEncapsulation } from "@angular/core";
import { SelectedThemeState } from "../../../state/theme-state";
import { Select } from "@ngxs/store";
import { Observable, Subject } from "rxjs";
import { GsmbTheme, ThemeBrightness } from "../../../model/theme";
import { takeUntil } from "rxjs/operators";
import { EnvConstants } from "../../../constants";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  encapsulation: ViewEncapsulation.None, // for making the component work with strict csp headers
})
export class HomeComponent implements OnDestroy {
  brightness: ThemeBrightness = "light";
  @Select(SelectedThemeState)
  private _selectedTheme$!: Observable<GsmbTheme>;

  private _destroy$ = new Subject<void>();

  readonly snfLogoLight = `${EnvConstants.ASSET_IMG_PATH}/SNF_logo_standard_web_color_pos_d.png`;
  readonly snfLogoDark = `${EnvConstants.ASSET_IMG_PATH}/SNF_logo_standard_web_color_neg_d.png`;
  readonly gsmbImage = `${EnvConstants.ASSET_IMG_PATH}/Gossembrot_s.jpg`;

  constructor() {
    this._selectedTheme$
      .pipe(takeUntil(this._destroy$))
      .subscribe((theme: GsmbTheme) => {
        if (!theme) {
          return;
        }
        this.brightness = theme.brightness;
      });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
