import { Injectable } from '@angular/core';
import {
  UpdateDoubleTileSources, UpdateLocalDoubleTileSources,
} from '../state/app-state';
import { Page } from '../model/page';
import { DataService } from '../data/dataservice.service';
import { Store } from '@ngxs/store';
import { BehaviorSubject, catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { LocalTileSource } from '../view/pages/page-manuscript/manuscript-browser/osd-viewer/osd-viewer.component';
import { EnvConstants } from '../constants';

export class GsmbTileSource {
  private _tileType!: 'local' | 'iiif';
  private _localTileSource!: LocalTileSource;
  private _iiifTileSource!: IiifTile;

  constructor(
    tileType: 'local' | 'iiif',
    tileSource: LocalTileSource | IiifTile
  ) {
    this._tileType = tileType;

    if (tileType === 'local') {
      this._localTileSource = tileSource as LocalTileSource;
    } else {
      this._iiifTileSource = tileSource as IiifTile;
    }
  }

  get id(): string {
    if (this.tileType === 'local') {
      return this._localTileSource.url;
    } else {
      return this._iiifTileSource.id;
    }
  }

  get tileType(): 'local' | 'iiif' {
    return this._tileType;
  }

  get localTileSource(): LocalTileSource {
    return this._localTileSource;
  }

  get iiifTileSource(): IiifTile {
    return this._iiifTileSource;
  }

  get tileSource(): LocalTileSource | IiifTile {
    if (this.tileType === 'local') {
      return this._localTileSource;
    } else {
      return this._iiifTileSource;
    }
  }
}

export interface IiifTile {
  type: string;
  id: string;
  width: number;
  height: number;
  infoJson: string;
  levels: any[];
  tiles: { width: number; scaleFactors: number[] }[];
}

@Injectable({
  providedIn: 'root',
})
export class TileSourceService {

  debugMode = new BehaviorSubject<boolean>(false);

  constructor(
    private _dataService: DataService,
    private _store: Store
  ) {}


  getSingleTileSource(page: Page | undefined): Observable<GsmbTileSource | undefined> {
    if (page?.iiifInfoUrl && (!page.autocomparedIiif || page.matchPercentage >= 25 || page.manuallyAddedIiif))  {
      return this._dataService.getIIIFinfo(page.iiifInfoUrl).pipe(
        map((infoJson) => new GsmbTileSource('iiif', infoJson)),
        catchError((error) => {
          console.error(error); // Fallback to local tile source if IIIF info cannot be fetched
          return of(this._getLocalTileSource(page.imgDir));
        })
      );
    } else {
      const ts = this._getLocalTileSource(page?.imgDir);
      return of(ts).pipe(
        catchError((error) => {
          console.error(error); // Log the error and return 404 image
          return of(this._getLocalTileSource());
        })
      );
    }
  }

  updateTileSources(pages: Page[]): void {
    if (this.debugMode.getValue()) {
      this._updateTileSourcesDebug(pages).catch((error) => {
        console.error('Error updating tile sources in debug mode:', error);
      });
    } else {
      this._updateTileSources(pages).catch((error) => {
        console.error('Error updating tile sources:', error);
      });
    }
  }

  private async _updateTileSources(pages: Page[]): Promise<void> {
    if (pages.length === 0) {
      return;
    }
    const tileSources: GsmbTileSource[] = [];
    for (const page of pages) {
      if (page.iiifInfoUrl && (!page.autocomparedIiif || page.matchPercentage >= 25 || page.manuallyAddedIiif)) {
        try {
          const infoJson$ = this._dataService.getIIIFinfo(page.iiifInfoUrl)
          const infoJson = await lastValueFrom(infoJson$);
          if (!infoJson) {
            console.error('Error fetching IIIF info: no infoJson');
            this._getLocalTileSource(page.imgDir); // Fallback to local tile source if IIIF info cannot be fetched
            continue;
          }
          tileSources.push(new GsmbTileSource('iiif', infoJson));
        } catch (error) {
          console.error('Error fetching IIIF info:', error);
        }
      } else {
        tileSources.push(this._getLocalTileSource(page.imgDir));
      }
    }
    this._store.dispatch(new UpdateDoubleTileSources(tileSources));
  }

  private async _updateTileSourcesDebug(pages: Page[]): Promise<void> {
    if (pages.length === 0) {
      return;
    }
    const localTileSources: GsmbTileSource[] = [];
    const tileSources: GsmbTileSource[] = [];
    for (const page of pages) {
      if (page.imgDir) {
        localTileSources.push(this._getLocalTileSource(page.imgDir));
      }

      if (page.iiifInfoUrl) {
        try {
          const infoJson = await lastValueFrom(this._dataService.getIIIFinfo(page.iiifInfoUrl));
          if (!infoJson) {
            console.error('Error fetching IIIF info: no infoJson');
            continue;
          }
          tileSources.push(new GsmbTileSource('iiif', infoJson));
        } catch (error) {
          console.error('Error fetching IIIF info:', error);
        }
      } else {
        if (page.externalImgUrl) {
          tileSources.push(this._getExternalImageTileSource(page.externalImgUrl));
        }
      }
    }
    this._store.dispatch(new UpdateDoubleTileSources(tileSources));
    this._store.dispatch(new UpdateLocalDoubleTileSources(localTileSources));
  }

  private _getLocalTileSource(url = EnvConstants.NOT_FOUND_IMG_PATH): GsmbTileSource {
    return new GsmbTileSource('local', {
      type: 'image',
      url,
      height: 1000,
      width: 1000,
    });
  }

  private _getExternalImageTileSource(imgUrl: string): GsmbTileSource {
    return new GsmbTileSource('local', {
      type: 'image',
      url: imgUrl,
      height: 1000,
      width: 1000,
    });
  }
}
