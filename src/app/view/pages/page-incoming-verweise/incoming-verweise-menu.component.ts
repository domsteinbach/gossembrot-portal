import { Component, OnInit } from "@angular/core";
import { RouteConstants } from "../../../routeConstants";
import { ActivatedRoute, Router } from "@angular/router";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { AuthService } from "../../../auth/auth.service";

@Component({
  selector: "app-incoming-verweise-menu",
  templateUrl: "./incoming-verweise-menu.component.html",
  styleUrls: ["./incoming-verweise-menu.component.scss"],
})
export class IncomingVerweiseMenuComponent implements OnInit {
  activeTabIndex = 0;

  constructor(
    public authService: AuthService,
    private _route: ActivatedRoute,
    private _router: Router,
  ) {}

  ngOnInit(): void {
    if (this._route.snapshot.firstChild) {
      const path =
        this._route.snapshot.firstChild.routeConfig?.path?.split("/")[0];
      switch (path) {
        case RouteConstants.IN_GSM_VALUE:
          this.activeTabIndex = 0;
          break;
        case RouteConstants.OUT_GSM_VALUE:
          this.activeTabIndex = 1;
          break;
        case RouteConstants.PRINTS_VALUE:
          this.activeTabIndex = 2;
          break;
        case RouteConstants.NON_HABEO_VALUE:
          this.activeTabIndex = 3;
          break;
        default:
          this.activeTabIndex = 0;
      }
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    switch (event.index) {
      case 0:
        this._router.navigate([RouteConstants.IN_GSM_VALUE], {
          relativeTo: this._route,
        });
        break;
      case 1:
        this._router.navigate([RouteConstants.OUT_GSM_VALUE], {
          relativeTo: this._route,
        });
        break;
      case 2:
        this._router.navigate([RouteConstants.PRINTS_VALUE], {
          relativeTo: this._route,
        });
        break;
      case 3:
        this._router.navigate([RouteConstants.NON_HABEO_VALUE], {
          relativeTo: this._route,
        });
        break;
      default:
        this._router.navigate([RouteConstants.RECONSTRUCTION]);
    }
  }
}
