import { Injectable } from "@angular/core";
import { GsmbTheme } from "../model/theme";

type LocalStarageItem = "version" | "theme" | "steckbriefPanelExpanded";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService {
  get theme(): GsmbTheme | null {
    return this._getItem<GsmbTheme>("theme") || null;
  }

  set theme(value: GsmbTheme) {
    this._setItem("theme", value);
  }

  get steckbriefPanelExpanded(): boolean | null {
    return this._getItem<boolean>("steckbriefPanelExpanded");
  }

  set steckbriefPanelExpanded(value: boolean) {
    this._setItem("steckbriefPanelExpanded", value);
  }

  private _setItem(key: LocalStarageItem, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private _getItem<T>(key: LocalStarageItem): T | null {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  }

  private _removeItem(key: LocalStarageItem): void {
    localStorage.removeItem(key);
  }

  private _clear(): void {
    localStorage.clear();
  }
}
