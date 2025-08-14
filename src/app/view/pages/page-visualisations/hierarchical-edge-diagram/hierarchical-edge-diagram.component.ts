import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { Select } from '@ngxs/store';
import { CarriersState } from '../../../../state/information-carrier-state.service';
import { filter, map, Observable, Subject } from 'rxjs';
import { InformationCarrier, Physicality } from '../../../../model/infoCarrier';
import { HierarchyNode, ZoomBehavior } from 'd3';
import { VisualizationRepository } from '../../../../data/repository/visualization-repository';
import { VisualisationVerweis } from '../../../../model/visualisations';
import { takeUntil } from 'rxjs/operators';

interface CategorizedData {
  id: string;
  name: string;
  size?: number;
  physicality?: Physicality;
  children: CategorizedData[];
}

@Component({
  selector: 'app-hierarchical-edge-diagram',
  templateUrl: './hierarchical-edge-diagram.component.html',
  styleUrls: ['./hierarchical-edge-diagram.component.scss'],
})
export class HierarchicalEdgeDiagramComponent implements OnInit, OnDestroy {
  @ViewChild('chart', { static: true })
  private chartContainer!: ElementRef<HTMLDivElement>;
  svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  categorizedData!: CategorizedData;

  private nodeCoordinates: { [id: string]: { x: number; y: number } } = {};

  private get contentGroup() {
    return this.svg.select('.content-group');
  }

  readonly colorin = '#00f';
  readonly colorout = '#f00';
  readonly colornone = '#ccc';

  readonly linkColorMap = (isSource: boolean) => {
    return isSource ? this.colorout : this.colorin;
  };

  readonly colorMap = (physicality?: Physicality) => {
    switch (physicality) {
      case 'Available':
        return '#020260';
      case 'Lost':
        return '#863103';
      case 'Classic':
        return '#294f02';
      default:
        return '#020202';
    }
  };

  viewBoxSize = 1080;
  offset = 100;
  radius = this.viewBoxSize / 2 - this.offset;
  width: number = window.innerWidth * 0.9;
  height: number = window.innerHeight * 0.9;

  @Select(CarriersState) carriers$!: Observable<InformationCarrier[]>;

  private _destroy$ = new Subject<void>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _vr: VisualizationRepository
  ) {}

  ngOnInit(): void {
    this.initSvg();

    // get the data for the nodes
    this.carriers$
      .pipe(takeUntil(this._destroy$))
      .subscribe((carriers: InformationCarrier[]) => {
        if (carriers.length > 0) {
          this.categorizedData = {
            id: 'root',
            name: '',
            children: [
              { id: '0', name: '', physicality: 'Available', children: [] },
              { id: '1', name: '', physicality: 'Lost', children: [] },
              { id: '2', name: '', physicality: 'Classic', children: [] },
            ],
          };

          carriers.forEach((carrier) => {
            const group = this.categorizedData.children.find(
              (g) => g.physicality === carrier.physicality
            );
            if (group) {
              group.children.push({
                id: carrier.id,
                name:
                  carrier.physicality === 'Available'
                    ? carrier.shelfMark
                    : carrier.title,
                physicality: carrier.physicality,
                size: 1, // Size could be a derived value or a constant if not specifically meaningful
                children: [],
              });
            }
          });

          // Now categorizedData is ready to be used to create the chart
          this.createNodes(this.categorizedData);

          // get the linking data/ the verweise and create the links between the carriers
          this._vr
            .getCarrierToCarrierVerweise()
            // filter out source carriers that are not: 'TR_A_0001'
            .pipe(
              takeUntil(this._destroy$),
              map((data) => data.filter((d) => d.source === 'TR_A_0001'))
            )
            .subscribe((data: VisualisationVerweis[]) => {
              this.createLinks(data);
            });
        }
      });
  }

  private initSvg(): void {
    const element = this.chartContainer.nativeElement;

    this.svg = d3
      .select(element)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [
        -(this.radius + this.offset),
        -(this.radius + this.offset),
        this.viewBoxSize + 2 * this.offset,
        this.viewBoxSize + 2 * this.offset,
      ]);

    // Create the group element that will be zoomable
    this.svg.append('g').attr('class', 'content-group');
    this.svg.style('cursor', 'grab'); // Set the cursor to grab when the mouse is over the SVG

    this.setZoomBehaviour();
  }

  private createNodes(data: CategorizedData): void {
    const root = d3.hierarchy(data, (d) => d.children);

    const cluster = d3.cluster().size([2 * Math.PI, this.radius - 100]);
    cluster(root as HierarchyNode<unknown>); // Apply the layout

    const displayName = (name: string) => {
      if (name.length > 25) {
        return name.substring(0, 25) + '...';
      }
      return name;
    };

    const nodes = this.contentGroup
      .append('g')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', (d) => {
        const angle = (d.x! * 180) / Math.PI - 90;
        const rotate = `rotate(${angle})`;
        const translate = `translate(${d.y!},0)`;
        const coords = { x: d.x!, y: d.y! }; // Store coordinates
        this.nodeCoordinates[d.data.id] = coords; // Store coordinates by ID
        return `${rotate} ${translate}`;
      });

    nodes
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', (d) => (d.x! < Math.PI ? 6 : -6))
      .attr('text-anchor', (d) => (d.x! < Math.PI ? 'start' : 'end'))
      .attr('transform', (d) => (d.x! >= Math.PI ? 'rotate(180)' : null))
      .text((d) => displayName(d.data.name))
      .style('fill', (d) => this.colorMap(d.data.physicality))
      .on('mouseover', (event, d) => this.overed(event, d))
      .on('mouseout', (event, d) => this.outed(event, d))
      .on('click', this.clicked.bind(this)); // Handle click events

    this._cdr.detectChanges();
    root.leaves().forEach((d) => {});
  }

  // Method to retrieve coordinates by ID
  getNodeCoordinatesById(id: string): { x: number; y: number } | undefined {
    return this.nodeCoordinates[id];
  }

  private createLinks(data: VisualisationVerweis[]): void {
    this.contentGroup
      .append('g')
      .selectAll('path') // Use paths for curved links
      .data(data)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: VisualisationVerweis) => {
        const sourceCoords = this.getNodeCoordinatesById(d.source);
        const targetCoords = this.getNodeCoordinatesById(d.target);

        if (sourceCoords && targetCoords) {
          const linkPath = d3.path();
          linkPath.moveTo(sourceCoords.x, sourceCoords.y);
          linkPath.quadraticCurveTo(0, 0, targetCoords.x, targetCoords.y);
          return linkPath.toString();
        }
        return '';
      });

    // Styling for links
    const links = this.contentGroup.selectAll('.link');
    links.attr('stroke', 'black').attr('stroke-width', 1);
  }

  private setZoomBehaviour(): void {
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        this.contentGroup.attr('transform', event.transform.toString());
      });

    // Enable scrolling for zooming
    this.svg.on('wheel', (event) => {
      if (!event.ctrlKey) {
        event.preventDefault(); // Prevent default scrolling behavior
        zoomBehavior.scaleBy(
          this.svg.transition().duration(50),
          event.deltaY > 0 ? 1.2 : 0.8
        ); // Zoom in or out based on scroll direction
      }
    });

    // Apply zoom by a specific scale factor on each zoom event
    // Apply zoom by a specific scale factor on each zoom event
    this.svg.call(zoomBehavior).on('wheel', (event) => {
      // Prevent default scroll behavior
      event.preventDefault();

      // Get the current zoom transformation
      const currentTransform = d3.zoomTransform(
        this.svg.node() as SVGSVGElement
      );

      // Compute the new scale factor based on the zoom factor
      const newScale =
        event.deltaY > 0 ? currentTransform.k * 1.2 : currentTransform.k / 1.2;

      // Apply zoom by the new scale factor
      this.svg.call(zoomBehavior.scaleTo, newScale);
    });
  }

  // Highlight the node and connected links on mouseover and change the cursor to pointer
  private overed(event: any, d: any): void {
    d3.select(event.currentTarget)
      .attr('font-weight', 'bold')
      .attr('font-size', '1.5em')
      .attr('fill', this.colorout)
      .style('cursor', 'pointer');

    /*
    d3.selectAll(d.incoming.map((link: any) => link[0].path))
      .attr('stroke', this.colorin)
      .raise();

    d3.selectAll(d.outgoing.map((link: any) => link[1].path))
      .attr('stroke', this.colorout)
      .raise();

     */
  }

  private outed(event: any, d: any): void {
    d3.select(event.currentTarget)
      .attr('font-weight', null)
      .attr('fill', null)
      .attr('font-size', null)
      .style('cursor', 'grab');

    /*d3.selectAll(
      d.incoming.concat(d.outgoing).map((link: any) => link.path)
    ).attr('stroke', this.colornone);*/
  }

  // Define the clicked method to handle click events
  private clicked(event: any, d: any): void {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
