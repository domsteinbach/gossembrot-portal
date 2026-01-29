import { Component, ViewChild, ViewEncapsulation } from "@angular/core";
import { RouteConstants } from "../../../routeConstants";

import { AuthService } from "../../../auth/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { LoginComponent } from "../../../auth/login/login.component";
import { MatMenuTrigger } from "@angular/material/menu";
import { GsmbTheme, ThemeBrightness, THEMES } from "../../../model/theme";
import { ThemeHandlerService } from "../../../service/theme.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  encapsulation: ViewEncapsulation.None, // for making the component work with strict csp headers
})
export class HeaderComponent {
  routeConstants = RouteConstants;

  currentBrightness: ThemeBrightness = "light";
  themes = THEMES;

  get isStaticBuild(): boolean {
    return environment.useSqlJs;
  }

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  constructor(
    public authService: AuthService,
    public dialog: MatDialog,
    private _themeHandler: ThemeHandlerService,
  ) {}

  toggleBrightness() {
    this._themeHandler.toggleBrightness();
    this.currentBrightness = this._themeHandler.brightness;
  }

  selectTheme(theme: GsmbTheme) {
    this._themeHandler.selectTheme(theme);
    this.currentBrightness = this._themeHandler.brightness;
  }

  openInNewTab(path: string) {
    window.open(`${path}`, "_blank");
  }

  openLoginDialog(): void {
    this.dialog.open(LoginComponent, {
      // position right under the button which opened the dialog
      position: { top: "64px", right: "8px" },
    });
  }
}
