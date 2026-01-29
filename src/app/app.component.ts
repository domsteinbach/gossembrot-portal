import {
  Component,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewEncapsulation,
} from "@angular/core";
import { Select, Store } from "@ngxs/store";
import { Title } from "@angular/platform-browser";
import { SelectedThemeState } from "./state/theme-state";
import { Observable, Subject, take } from "rxjs";
import { GsmbTheme, GsmbThemeClass } from "./model/theme";
import { LocalStorageService } from "./service/local-storage.service";
import { takeUntil } from "rxjs/operators";
import { InfoCarrierRepository } from "./data/repository/info-carrier-repository";
import { UpdateCarriers } from "./state/information-carrier-state.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None, // for making the component work with strict csp headers
})
export class AppComponent implements OnInit, OnDestroy {
  title = "Gossembrot Bibliothek";

  private _currentTheme: GsmbThemeClass | null = null;

  @Select(SelectedThemeState)
  private _selectedTheme$!: Observable<GsmbTheme>;

  private _destroy$ = new Subject<void>();

  constructor(
    private _localStorageService: LocalStorageService, // do not remove; to initialize the local storage service
    private _icr: InfoCarrierRepository,
    private renderer: Renderer2,
    private _store: Store,
    private _titleService: Title,
  ) {
    this._selectedTheme$.pipe(takeUntil(this._destroy$)).subscribe((theme) => {
      if (theme) {
        this.applyThemeClass(theme.themeClass);
      }
    });
  }

  ngOnInit() {
    this._titleService.setTitle(this.title);

    this._icr
      .informationCarriers$()
      .pipe(take(1))
      .subscribe((carriers) => {
        this._store.dispatch(new UpdateCarriers(carriers));
      });
  }

  // apply a given theme class to the body
  applyThemeClass(themeClass: GsmbThemeClass) {
    if (this._currentTheme) {
      this.renderer.removeClass(document.body, this._currentTheme);
    }
    this.renderer.addClass(document.body, themeClass);
    this._currentTheme = themeClass;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
