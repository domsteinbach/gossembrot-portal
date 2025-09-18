import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import * as OpenSeadragon from 'openseadragon';
import { GsmbTileSource } from '../../../service/tile-source.service';
import { TileSourceService } from '../../../service/tile-source.service';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../model/page';

@Component({
  selector: 'app-osd-editor',
  templateUrl: './osd-editor.component.html',
  styleUrls: ['./osd-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsdEditorComponent implements OnChanges {
  @Input() page?: Page;

  tileSource!: GsmbTileSource | undefined;

  @ViewChild('osdEditor', { static: false }) osdEditor!: ElementRef;

  private _osd!: OpenSeadragon.Viewer | undefined;

  protected imageLoading = false;

  constructor(
    private _crd: ChangeDetectorRef,
    private _tileSourceService: TileSourceService
  ) {
    OpenSeadragon.setString('Tooltips.Home', 'Standardgrösse');
    OpenSeadragon.setString('Tooltips.ZoomIn', 'Ansicht vergrössern');
    OpenSeadragon.setString('Tooltips.ZoomOut', 'Ansicht verkleinern');
    OpenSeadragon.setString('Tooltips.FullPage', 'Vollbild ein/aus');
    OpenSeadragon.setString('Tooltips.RotateLeft', 'nach links drehen');
    OpenSeadragon.setString('Tooltips.RotateRight', 'nach rechts drehen');
  }

  ngOnChanges() {
    if (!this.page) {
      return;
    }
    this._tileSourceService
      .getSingleTileSource(this.page)
      .subscribe((tileSource: GsmbTileSource | undefined) => {
        if (!tileSource) {
          console.warn('no tile source emitted from store');
          return;
        }
        this.tileSource = tileSource;
        this.display();
      });

  }

  display() {
    if (!this._osd) {
      this.initOpenSeadragon();
    } else {
      this.updateOpenSeadragon();
    }
  }

  initOpenSeadragon() {
    this.imageLoading = true;
    if (!this.tileSource) {
      console.warn('no tile source');
      return;
    }
    this._osd?.destroy();
    this._crd.detectChanges();
    this._osd = OpenSeadragon({
      id: this.tileSource.id,
      element: this.osdEditor.nativeElement,
      tileSources: this.tileSource?.tileSource,
      zoomPerClick: 1,
      prefixUrl: environment.osdPrefixUrl,
      // Increase maxZoomPixelRatio to allow deeper zooming
      maxZoomPixelRatio: 5, // Allows zooming to 5 times the native resolution of the image
      // Reduce the animationTime to reduce the animation delay. The closer to 0, the faster the animation
      animationTime: 0.2,
      // Increase zoom speed for mouse wheel
      zoomPerScroll: 1.3, // Default is 1.2, increase for faster zoom
      springStiffness: 7,
      showRotationControl: true,
      showZoomControl: false,
      showNavigator: true,
      navigatorPosition: 'BOTTOM_RIGHT',
      navigatorHeight: 100,
      navigatorWidth: 100,
    });
    this.addTileHandlers();
    this._osd.open(this.tileSource?.tileSource);

    this._crd.detectChanges();
  }

  updateOpenSeadragon() {
    this._osd?.drawer.clear();
    this._crd.detectChanges();
    if (!this.tileSource?.tileSource) {
      console.warn('no tile source');
      return;
    }
    this.imageLoading = true;

    this.addTileHandlers();
    this._osd?.open(this.tileSource?.tileSource);
    this._crd.detectChanges();
  }


  private addTileHandlers() {
    if (!this._osd) {
      return;
    }

    this._osd.addHandler('tile-loaded', () => {
      this.imageLoading = false;
      this._crd.detectChanges()
    });

    this._osd.addHandler('tile-load-failed', () => {
      this.imageLoading = false;
      this._crd.detectChanges();
    });
  }
}
