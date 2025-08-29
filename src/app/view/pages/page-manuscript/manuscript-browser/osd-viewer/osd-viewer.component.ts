import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ElementRef, Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as OpenSeadragon from 'openseadragon';
import { GsmbTileSource } from '../../../../../service/tile-source.service';
import { Options } from 'openseadragon';
import { Store } from '@ngxs/store';
import { DoubleTileSourcesState, LocalDoubleTileSourcesState } from '../../../../../state/app-state';
import { distinctUntilChanged, Observable, Subject } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import {EnvConstants} from "../../../../../constants";

// tile source interface for non iiif images
export interface LocalTileSource {
  type: string;
  url: string;
  width: number;
  height: number;
}

@Component({
  selector: 'app-osd-viewer',
  templateUrl: './osd-viewer.component.html',
  styleUrls: ['./osd-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsdViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() forceLocalTileSource= false;

  private destroy$ = new Subject<void>();

  private tileSources$: Observable<GsmbTileSource[]> | undefined = undefined; // observable for tile sources, if needed
  private tileSources: GsmbTileSource[] = []; // one or more tile sources for displaying in the OSD viewer

  @ViewChild('osdContainer', { static: false }) osdContainer!: ElementRef;

  private _osd!: OpenSeadragon.Viewer;

  imageLoading = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private _store: Store
  ) {}

  ngOnInit() {

    this.tileSources$ = this.forceLocalTileSource ? this._store.select(LocalDoubleTileSourcesState) : this._store.select(DoubleTileSourcesState);
    this.tileSources$
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((tileSources) => {
        if (!tileSources) {
          return;
        }
          this.tileSources = tileSources;
          console.log('OSD Viewer tile sources updated:', this.tileSources);
          this.updateOpenSeadragonPages();
      });
  }

  ngAfterViewInit() {
    this.initOpenSeadragon();
  }

  initOpenSeadragon() {
    if (!this.osdContainer) {
      return;
    }

    const osdOptions: Options = {
      id: 'someID', // todo: Change
      element: this.osdContainer.nativeElement,
      prefixUrl: EnvConstants.OSD_PREFIX_URL, // the path to the openseadragon buttons images like zoom-in etc.
      showNavigator: true,
      navigatorPosition: 'BOTTOM_RIGHT',
      navigatorHeight: 100,
      navigatorWidth: 100,
      sequenceMode: false, // we have our own sequence mode, i.e. an own pages order, and we only pass two images max.
      tileSources: [], // Will be populated with individual tile sources at updating
      zoomPerClick: 1.0, // prevent zooming on single click
      // Increase maxZoomPixelRatio to allow deeper zooming
      maxZoomPixelRatio: 5, // Allows zooming to 5 times the native resolution of the image
      // Reduce the animationTime to reduce the animation delay. The closer to 0, the faster the animation
      animationTime: 0.2,
      // Increase zoom speed for mouse wheel
      zoomPerScroll: 1.3, // Default is 1.2, increase for faster zoom
      springStiffness: 7,
      showRotationControl: true,
      showZoomControl: false,
    };
    this._osd = OpenSeadragon(osdOptions);

    this.addTileHandlers();

    // Set the initial position and zoom level after the viewer has been initialized
    this._osd.addHandler('open', () => {
      const combinedWidth = 2; // Assuming two tiles side by side
      const combinedHeight = Math.ceil(this.tileSources.length / 2);
      const center = new OpenSeadragon.Point(
        combinedWidth / 2,
        combinedHeight / 2
      );
      const zoom = 1; // You can adjust the initial zoom level as needed

      this._osd.viewport.panTo(center, true);
      this._osd.viewport.zoomTo(zoom, center, true);
    });

    this.updateOpenSeadragonPages();
  }

  updateOpenSeadragonPages() {
    if (!this._osd || !this.tileSources?.length) {
      this._osd?.world?.removeAll();
      return; // guard
    }
    this._osd.world.removeAll();
    this.imageLoading = true;
    this.cdr.detectChanges();
    for (let i = 0; i < this.tileSources.length; i++) {
      if (this.tileSources[i].tileType === 'local') {
        // For local images, use a regular image tile source
        this._osd.addTiledImage({
          tileSource: this.tileSources[i].tileSource,
          x: i % 2,
          y: Math.floor(i / 2),
          width: 1,
          success: () => {
            // center the viewport
            this.centerViewport();
          },
        });
      } else if (this.tileSources[i].tileType === 'iiif') {
        // For IIIF images, use the IIIF tile source configuration object
        this._osd.addTiledImage({
          tileSource: this.tileSources[i].iiifTileSource, // Pass the JSON directly as the tile source
          x: i % 2,
          y: Math.floor(i / 2),
          width: 1,
          success: () => {
            // center the viewport
            this.centerViewport();
          },
        });
      }
    }
  }

  centerViewport() {
    const originalAnimationTime = (this._osd as any).animationTime;

    // Temporarily disable animation
    (this._osd as any).animationTime = 0;

    // Go to the "home" view which centers the image and resizes it to fit the viewport
    this._osd.viewport.goHome(true);

    // Restore the original animation time
    (this._osd as any).animationTime = originalAnimationTime;
  }

  private addTileHandlers() {
    if (!this._osd) {
      return;
    }

    this._osd.addHandler('tile-loaded', () => {
      this.imageLoading = false;
      this.cdr.detectChanges();
    });

    this._osd.addHandler('tile-load-failed', () => {
      this.imageLoading = false; // Image failed to load
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this._osd) {
      this._osd.close();
      this._osd.destroy();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
