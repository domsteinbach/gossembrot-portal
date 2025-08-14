import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
import { MatDialog } from '@angular/material/dialog';
import {
  InteractionMode,
  VisualisationDataService,
} from '../visualisation-data.service';
import { InformationCarrier, Physicality } from '../../../../../model/infoCarrier';
import { Subscription } from 'rxjs';
import { Granularity } from '../visualisation-settings.service';
import { CarrierText } from '../../../../../model/carriertext';
import { DisplayVerweis } from '../../../../../model/verweis';

export type NodeType =
  | 'LostManuscript'
  | 'LostPrint'
  | 'Available'
  | 'Classic'
  | 'textNode'
  | 'Undefined';

class ToolTip {
  // private bc. of referencing issues by d3. D3 is updating positions coming from events
  private _posX = 0;
  private _posY = 0;
  constructor(
    private _id: string,
    private _content: string,
    position: { x: number; y: number }
  ) {
    this._posX = position.x;
    this._posY = position.y;
  }

  get id(): string {
    return this._id;
  }

  get content(): string {
    return this._content;
  }

  get position() {
    return { x: this._posX, y: this._posY };
  }

  // no usual setter bc. of referenceing issues. Prevent D3 from updating through any events
  updatePosition(x: number, y: number) {
    this._posX = x;
    this._posY = y;
  }
}

@Component({
  selector: 'app-force-directed-graph',
  templateUrl: './force-directed-graph.component.html',
  styleUrls: ['./force-directed-graph.component.scss'],
})
export class ForceDirectedGraphComponent
  implements OnInit, OnChanges, OnDestroy
{
  @ViewChild('visContainer', { static: true })
  private visContainer!: ElementRef;
  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;
  @Input() nodes: any[] = [];
  @Input() links: any[] = [];
  @Input() granularity: Granularity = 'InformationCarrier';

  readonly debouncedResizeHandler: () => void;

  svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  permanentlyHighlightedLinks: any[] = [];

  fullScreen = false;
  legendVisible = true;
  tooltipsVisible = true;

  permanentTooltips: ToolTip[] = [];
  permanentTooltipsVisible = true;

  // on the fly tooltips when hovered
  hoverTooltipVisible = false;
  hoverTooltipPosition = { x: 0, y: 0 };
  hoverTooltipContent = '';
  hoverTooltipType = 'linkTooltip' || 'nodeTooltip' || 'textTooltip' || '';
  requestedHoverTooltip = '';

  currentTabSub!: Subscription;
  currentTab!: InteractionMode;
  // If currentTab is info, do not select emit. Do only info select emit

  selectedCarriersSub!: Subscription;
  selectedCarriers: string[] = [];

  selectedLinksSub!: Subscription;

  //readonly offset = 100;
  // readonly radius = this.viewBoxSize / 2 - this.offset;
  width!: number;
  height!: number;

  get shiftX() {
    return this.width / 2;
  }

  get shiftY() {
    return this.height / 2;
  }

  private get contentGroup() {
    return this.svg.select('.content-group');
  }

  private getParentDimensions(): { width: number; height: number } | null {
    const parentElement = this.chartContainer.nativeElement.parentElement;
    if (parentElement) {
      const { width, height } = parentElement.getBoundingClientRect();
      return { width, height };
    } else {
      return null;
    }
  }

  // link colors
  readonly colorin = '#0033ff';
  readonly colorout = '#0033ff';
  readonly colordefault = '#a2a2a2';

  readonly linkColorMap = (isSource: boolean) => {
    return isSource ? this.colorout : this.colorin;
  };

  getNodeType(d: any): NodeType {
    if (!d.physicality) {
      return 'textNode';
    } else {
      d = d as InformationCarrier;
    }
    if ((d.physicality as Physicality) == 'Available') {
      return 'Available';
    }
    if ((d.physicality as Physicality) == 'Classic') {
      return 'Classic';
    }

    if ((d.physicality as Physicality) == 'Lost') {
      if (d.carrierType === 'Print') {
        return 'LostPrint';
      }
      if (d.carrierType === 'Manuscript') {
        return 'LostManuscript';
      }
    }
    return 'Undefined';
  }

  readonly colorMap = (key?: NodeType) => {
    switch (key) {
      case 'Available':
        return '#00a100';
      case 'LostManuscript':
        return '#e30000';
      case 'LostPrint':
        return '#d902b5';
      case 'Classic':
        return '#e5d501';
      case 'textNode':
        return '#797979';
      default:
        return '#020202';
    }
  };

  readonly legendItems = [
    { color: this.colorMap('Available'), label: 'Erhaltene Textträger' },
    {
      color: this.colorMap('LostManuscript'),
      label: 'Rekonstruierte Handschriften',
    },
    { color: this.colorMap('LostPrint'), label: 'Rekonstruierte Drucke' },
    { color: this.colorMap('Classic'), label: 'Kanonische Werke' },
  ];

  constructor(
    private _cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private _visService: VisualisationDataService
  ) {
    this.currentTabSub = this._visService.interactionMode$.subscribe(
      (tab: InteractionMode) => {
        this.currentTab = tab;
      }
    );

    // subscribe to the selected carrier and highlight it
    this.selectedCarriersSub = this._visService.selectedCarriers$.subscribe(
      (carriers) => {
        // get all carriers from this.selectedCarriers carriers which are not in carriers anymore
        this.selectedCarriers = carriers.map((carrier) => carrier.id);
        if (this.granularity === 'CarrierText') {
          return;
        }
        this.reRenderAllHighlightedNodes();
      }
    );

    this.selectedLinksSub = this._visService.selectedVerweise$.subscribe(
      (verweise: DisplayVerweis[]) => {

        verweise.forEach((v) => {
          if (!verweise) {
            console.error('verweise is null or undefined');
            return;
          }
          // get all links with sam target and source
          const links = this.links.filter((l: any) => {
            if (this.granularity === 'CarrierText') {
              return l.source?.id === v.srcText && l.target?.id === v.targetText;
            } else {
              return l.source?.id === v.srcCar && l.target?.id === v.targetCar;
            }
          });
          // push to linksOfVerweise if not already in there
          links.forEach((l) => {
            if (!this.permanentlyHighlightedLinks.includes(l)) {
              this.permanentlyHighlightedLinks.push(l);
            }
          });

          const notSelectedAnymore = this.permanentlyHighlightedLinks.filter(
            (l) => !links.includes(l)
          );

          notSelectedAnymore.forEach((link) => {
            // splice
            this.permanentlyHighlightedLinks.splice(
              this.permanentlyHighlightedLinks.indexOf(link),
              1
            );
            this.unhighlightPermanentLink(link);
          });
        });
      }
    );

    this.debouncedResizeHandler = debounce(() => this.onResizeEnd(), 200);
  }

  ngOnInit() {
    window.addEventListener('resize', this.debouncedResizeHandler);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['granularity'] && this.granularity === 'CarrierText') {
      this.permanentTooltips = [];
    }
    if (this.nodes.length === 0 || this.links.length === 0) {
      return;
    }
    this._init();
  }

  private _init() {

    d3.select(this.chartContainer.nativeElement).select('svg').remove();
    // Hard remove tooltip elements from the DOM bc. D3 makes magic sometimes
    const tooltipElements =
      this.visContainer.nativeElement.querySelectorAll('.tooltip');
    tooltipElements.forEach((element: any) => {
      element.remove();
    });

    this._cdr.detectChanges();
    this.initGraph();
  }

  private initGraph() {
    this.width = this.getParentDimensions()?.width || 0;
    this.height = this.getParentDimensions()?.height || 0;

    this.initSvg();
    this.createForceDirectedGraph();
  }

  private initSvg(): void {
    const element = this.chartContainer.nativeElement;

    this.svg = d3
      .select(element)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // add the arrowhead marker definition for the links
    this.svg.append('defs').html(`
        <marker id="arrowhead" markerWidth="5" markerHeight="4" 
        refX="2.5" refY="2" orient="auto">
        <polygon points="0 0, 5 2, 0 4" />
        </marker>
    `);

    // Create the group element that will be zoomable
    this.svg.append('g').attr('class', 'content-group');
    this.svg.style('cursor', 'grab'); // Set the cursor to grab when the mouse is over the SVG

    this.setZoomBehavior();
  }

  private setZoomBehavior(): void {
    let zoomStartTransform = d3.zoomIdentity;
    let hasZoomed = false;
    const zoom = d3
      .zoom<SVGSVGElement, any>()
      .scaleExtent([0.3, 4])
      .on('start', (event) => {
        zoomStartTransform = event.transform;
        hasZoomed = false;
        this.permanentTooltipsVisible = false;
      })
      .on('zoom', (event) => {
        const dx = event.transform.x - zoomStartTransform.x;
        const dy = event.transform.y - zoomStartTransform.y;
        const dz = event.transform.k - zoomStartTransform.k;
        if (Math.sqrt(dx * dx + dy * dy) > 5 || Math.abs(dz) > 0.01) {
          hasZoomed = true;
          this.contentGroup.attr('transform', event.transform);
        }
      })
      .on('end', () => {
        if (hasZoomed) {
          this.updatePermanentTooltipPositions();
        }
        this.permanentTooltipsVisible = true;
      });

    this.svg.call(zoom);
  }

  createForceDirectedGraph(): void {
    // Create the simulation

    // Ensure all links have valid nodes as source/target
    const validLinks = this.links.filter((link) => {
      const sourceNode = this.nodes.find(node => node.id === link.source);
      const targetNode = this.nodes.find(node => node.id === link.target);

      if (!sourceNode || !targetNode) {
        return false; // Exclude this link from the simulation
      }
      return true; // Keep this link in the simulation
    });
    const simulation = d3
      .forceSimulation(this.nodes)
      .force(
        'link',
        d3
          .forceLink(validLinks)
          .id((d: any) => d?.id)
          .distance(20)
      )

      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(this.shiftX, this.shiftY).strength(0.05))
      .force('collision', d3.forceCollide().radius(30)) // Adjust radius as needed

      .alphaDecay(0.08) // Set the alpha decay rate
      .alphaTarget(0.0001) // Set the target alpha value;
      .on('end', () => this.onSimulationEnded()); // Listen for the end event

    const strokeWidthScale = d3
      .scaleLinear()
      .domain([
        d3.min(this.links, (d) => d.number_of_verweise),
        d3.max(this.links, (d) => d.number_of_verweise),
      ])
      .range([1, 5]); // Min and max stroke widths

    // Create the links
    const link = this.contentGroup
      .selectAll('.link')
      .data(this.links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('stroke', this.colordefault)
      .attr('fill', 'none') // Ensure paths are not filled
      .attr('stroke-width', (d) => strokeWidthScale(d.value || 1));

    // Create the nodes
    const node = this.contentGroup
      .selectAll('.node')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', 5)
      .attr('fill', (d: any) => this.colorMap(this.getNodeType(d)))
      .on('mouseover', (event, d) => this.nodeHovered(event, d))
      .on('mouseout', (event, d) => this.nodeOuted(event))
      .on('click', (event, d) => this.nodeClicked(d));

    // Add the nodes and links to the simulation
    simulation.nodes(this.nodes).on('tick', () => {
      link
        .attr('d', (d: any) => {
          if (!d.source?.x || !d.source?.y  || !d.target?.x || !d.target?.y) {
            return '';
          }
          // Calculate the control points for curved lines
          const dx = d?.target?.x - d?.source?.x;
          const dy = d?.target?.y - d?.source?.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * (1 + d.index * 0.1); // Adjust dr for multiple links

          // Calculate the angle of the line
          const angle = Math.atan2(dy, dx);

          // Calculate the offset distance for the arrowhead
          const arrowheadLength = 10; // Adjust based on your arrowhead size
          const modifier = d.value > 10 ? d.value / 3 : 1;
          const offsetX = Math.cos(angle) * (arrowheadLength + modifier);
          const offsetY = Math.sin(angle) * (arrowheadLength + modifier);

          // Adjust the target position for the arrowhead
          const targetX = d.target.x - offsetX;
          const targetY = d.target.y - offsetY;

          // Return the path commands for curved lines
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
        })
        .attr('stroke-width', (d: any) => (d.value / 5 < 1 ? 1 : d.value / 5))
        .attr('marker-end', 'url(#arrowhead)')
        .on('mouseover', (event, d) => this.linkHovered(event, d))
        .on('mouseout', (event, d) => this.linkOuted())
        .on('click', (event, d) => this.linkClicked(d));

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    });
    this.initNodeDrag(simulation);
  }

  initNodeDrag(simulation: d3.Simulation<any, any>): void {
    const nodes = d3.selectAll<SVGCircleElement, any>('.node'); // Explicitly specify the element type
    let hasDragged = false;

    const drag = d3
      .drag<SVGCircleElement, any>()
      .on('start', (event, d: any) => {
        this.permanentTooltipsVisible = false;
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
        simulation.alphaTarget(0.02).restart();
        hasDragged = true;
      })
      .on('end', (event, d: any) => {
        simulation.alphaTarget(0).stop();
        d.fx = null;
        d.fy = null;
        if (hasDragged) {
          this.updatePermanentTooltipPositions();
        }
        this.permanentTooltipsVisible = true;
      });

    nodes.call(drag);
  }

  onSimulationEnded() {
    this.reRenderAllHighlightedNodes();
  }

  // Highlight the node and connected links on mouseover and change the cursor to pointer
  private nodeHovered(event: any, d: any): void {
    d3.select(event.currentTarget).style('cursor', 'pointer').attr('r', 10); // make node bigger
    this.requestedHoverTooltip = d.id;
    // also highlight the connected links as well as the targets and sources after a delay
    this.highlightLinksOfNode(d);
    setTimeout(() => {
      if (d.id !== this.requestedHoverTooltip) {
        // avoid popping up "old" tooltips
        return;
      }
      this.showNodeTooltip(d);
    }, 500);
  }

  highlightSelectedCarrier(id: string): void {
    d3.selectAll('.node')
      .filter((d: any) => d.id === id)
      .attr('r', 10)
      .attr('fill', 'red');
  }

  unhighlightSelectedCarier(id: string): void {
    d3.selectAll('.node')
      .filter((d: any) => d.id === id)
      .attr('r', 5)
      .attr('fill', (d: any) => this.colorMap(this.getNodeType(d)));
  }

  private nodeOuted(event: any): void {
    d3.select(event.currentTarget).style('cursor', 'grab');
    this.unhilightAllNodes();
    this.hideTooltip();
    this.unhighlightAllLinks();
    this.requestedHoverTooltip = '';
  }

  unhilightAllNodes(): void {
    d3.selectAll('.node').attr('r', 5);
  }

  private highlightLinksOfNode(node: any): void {
    if (!node?.id) {
      return;
    }
    const outgoingLinks = this.links.filter(
      (link: any) => link.source?.id === node?.id
    );

    const incomingLinks = this.links.filter(
      (link: any) => link.target.id === node.id
    );

    // Highlight outgoing links
    d3.selectAll('.link') // Select all elements with class 'link'
      .filter((d: any) => outgoingLinks.some((link) => link === d)) // Filter to outgoing links
      .attr('stroke', this.linkColorMap(true));

    // Highlight incoming links
    d3.selectAll('.link') // Select all elements with class 'link'
      .filter((d: any) => incomingLinks.some((link) => link === d)) // Filter to incoming links
      .attr('stroke', this.linkColorMap(false));
  }

  private unhighlightAllLinks(): void {
    // unhighlight all except the permanently highlighted links
    d3.selectAll('.link')
      .filter((d: any) => !this.permanentlyHighlightedLinks.includes(d))
      .attr('stroke', this.colordefault)
      .attr('stroke-width', (d: any) => (d.value / 5 < 1 ? 1 : d.value / 5));
  }

  private nodeClicked(d: any): void {
    if (d instanceof CarrierText) {
      // guard
      return;
    }
    // if node already highlighted, unhighlight it, but only if we are in selection tab
    if (this.currentTab === 'select' && this.selectedCarriers.includes(d.id)) {
      this._visService.unselectCarrier(d);
      this.removePermanentTooltip(d);
      return;
    } // else highlight it
    this.addPermanentTooltip(d, this.currentTab !== 'select');
    this.hideTooltip(); // hide on the fly tooltip
    if (this.currentTab === 'select') {
      this._visService.selectCarrier(d);
    } else {
      this._visService.setLastSelectedCarrier(d);
    }
  }

  linkHovered(event: any, d: any): void {
    d3.select(event.currentTarget)
      .style('cursor', 'pointer')
      .attr('stroke', this.colorin);
    // Highlight the connected nodes after a delay
    this.requestedHoverTooltip = d.id;
    this.highlightConnectedNodes(d);
    setTimeout(() => {
      if (d.id !== this.requestedHoverTooltip) {
        // avoid popping up "old" tooltips
        return;
      }
      // Append a title for tooltip
      this.showLinkTooltip(event, d);
    }, 500);
  }

  highlightConnectedNodes(link: any): void {
    d3.selectAll('.node')
      .filter((d: any) => d === link.source || d === link.target)
      .attr('r', 10);
  }

  linkClicked(linkData: any): void {
    // mark the link as selected
    this._visService.selectVerweis(linkData);
  }

  highlightLinkPermanently(link: any): void {
    d3.selectAll('.link')
      .filter((d: any) => d.index === link.index)
      .attr('stroke-width', 3)
      .attr('stroke', this.colorin);
  }

  unhighlightPermanentLink(link: any): void {
    d3.selectAll('.link')
      .filter((d: any) => d.index === link.index)
      .attr('stroke-width', (d: any) => (d.value / 5 < 1 ? 1 : d.value / 5))
      .attr('stroke', this.colordefault);
  }

  showNodeTooltip(data: any): void {
    if (
      this.tooltipsVisible &&
      this.permanentTooltips.findIndex((tt) => tt.id === data.id) > -1
    ) {
      return; // do not show hover tooltip if there is already a static one for that node
    }
    this.hoverTooltipType =
      data instanceof CarrierText ? 'textTooltip' : 'nodeTooltip';
    this.hoverTooltipVisible = true;
    this.hoverTooltipContent = `<div>${data.fullTitle}</div>`;
    // Apply the transformation matrix to the node positions
    const contentGroupNode = this.contentGroup.node();

    if (contentGroupNode instanceof Element) {
      const transform = d3.zoomTransform(contentGroupNode);
      const transformedX = transform.applyX(data.x);
      const transformedY = transform.applyY(data.y);
      this.hoverTooltipPosition = { x: transformedX, y: transformedY };
    }
    this._cdr.detectChanges();
  }

  reRenderAllHighlightedNodes() {
    const nodes = d3.selectAll('.node').data();
    nodes.forEach((node: any) => {
      this.removePermanentTooltip(node);
      // readd tooltip with new position
      if (
        ['InformationCarrier', 'CarrierAndText'].includes(this.granularity) &&
        this.selectedCarriers.findIndex((c) => c == node.id) > -1
      ) {
        this.addPermanentTooltip(node);
      }
    });
    this.permanentTooltipsVisible = true;
  }

  addPermanentTooltip(data: any, temporary = false): void {
    // Apply the transformation matrix to the node positions
    const contentGroupNode = this.contentGroup.node();

    if (contentGroupNode instanceof Element) {
      const transform = d3.zoomTransform(contentGroupNode);
      const transformedX = transform.applyX(data.x);
      const transformedY = transform.applyY(data.y);
      const tooltip = new ToolTip(data.id, `<div>${data.fullTitle}</div>`, {
        x: transformedX,
        y: transformedY,
      });
      if (temporary) {
        // do not change anything in the selected carriers
        return;
      }
      const idx = this.permanentTooltips.findIndex((t) => t.id === tooltip.id);

      if (idx > -1) {
        this.permanentTooltips[idx] = tooltip;
      } else {
        this.permanentTooltips.push(tooltip);
      }
    }
  }

  removePermanentTooltip(data: any): void {
    this.permanentTooltips = this.permanentTooltips.filter(
      (tooltip) => tooltip.id !== data.id
    );
  }

  updateSizeandPermanentTooltipPositions() {
    this.width = this.getParentDimensions()?.width || 0;
    this.height = this.getParentDimensions()?.height || 0;
    this.svg.attr('width', this.width).attr('height', this.height);
    this.updatePermanentTooltipPositions();
  }

  updatePermanentTooltipPositions(): void {
    const contentGroupNode = this.contentGroup.node();

    if (contentGroupNode instanceof Element) {
      const transform = d3.zoomTransform(contentGroupNode);

      this.permanentTooltips.forEach((tt) => {
        // Select the node from D3 by ID
        const nodeElement = d3
          .selectAll('.node')
          .filter((d: any) => d.id === tt.id)
          .node();
        if (nodeElement) {
          const nodeData: any = d3.select(nodeElement).data()[0];
          if (nodeData) {
            // Apply the transformation matrix to the node positions
            const transformedX = transform.applyX(nodeData.x);
            const transformedY = transform.applyY(nodeData.y);

            tt.updatePosition(transformedX, transformedY);
          }
        }
      });
    }
  }

  showLinkTooltip(event: any, data: any): void {
    const contentGroupNode = this.contentGroup.node();
    if (contentGroupNode instanceof Element) {
      const transform = d3.zoomTransform(contentGroupNode);

      // Calculate the midpoint between the source and target nodes
      const midpointX = (data.source.x + data.target.x) / 2;
      const midpointY = (data.source.y + data.target.y) / 2;

      // Apply the transformation matrix to the midpoint
      const transformedX = transform.applyX(midpointX);
      const transformedY = transform.applyY(midpointY);
      this.hoverTooltipType = 'linkTooltip';
      this.hoverTooltipPosition = { x: transformedX, y: transformedY };
      this.hoverTooltipContent = `<div>${data.srcTitle}</div><br>
                           <div>verweist ${data.value} mal nach</div><br>
                           <div>${data.targetTitle}</div>`;
      this.hoverTooltipVisible = true;
      this._cdr.detectChanges();
    }
  }

  hideTooltip(): void {
    this.hoverTooltipVisible = false;
    this.hoverTooltipType = '';
    this._cdr.detectChanges();
  }

  linkOuted(): void {
    this.unhighlightAllLinks();
    this.hideTooltip();
    this.unhilightAllNodes();
    this.requestedHoverTooltip = '';
  }
  /*

  hideUnselectedNodes(): void {
    d3.selectAll('.node').style('display', (d: any) =>
      this.selectedCarriers.includes(d.id) ? null : 'none'
    );
  }

  hideLinksOfUnselectedNodes(): void {
    d3.selectAll('.link').style('display', (d: any) =>
      this.selectedCarriers.includes(d.source.id) ||
      this.selectedCarriers.includes(d.target.id)
        ? null
        : 'none'
    );
  }



  showAllNodesAndLinks(): void {
    d3.selectAll('.node, .link').style('display', null);
  }


   */

  toggleFullscreen(): void {
    this.fullScreen = !this.fullScreen;
    this._cdr.detectChanges();

    this.updateSizeandPermanentTooltipPositions();
  }

  takeScreenshot(): void {
    const svg = this.chartContainer.nativeElement.querySelector('svg');
    if (!svg) {
      return;
    }

    const width = this.width * 3;
    const height = this.height * 3;

    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;

    // Set the viewBox attribute to scale the content
    clonedSvg.setAttribute('width', width.toString());
    clonedSvg.setAttribute('height', height.toString());
    clonedSvg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`); // use original w & h here!!!

    // Create a foreignObject to include the tooltips
    const foreignObject = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'foreignObject'
    );
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');

    const tooltips =
      this.visContainer.nativeElement.querySelector(
        '.tooltip-container'
      )?.innerHTML;

    const legend =
      this.visContainer.nativeElement.querySelector(
        '.legend-container'
      )?.innerHTML;

    if (tooltips) {
      // Create a div to hold the tooltips and set its inner HTML to the tooltips container's inner HTML
      const div = document.createElement('div');
      div.innerHTML = tooltips;

      // Append the div to the foreignObject
      foreignObject.appendChild(div);

      // Append the foreignObject to the cloned SVG
      clonedSvg.appendChild(foreignObject);

      // Copy styles from document into SVG
      copyStylesInline(clonedSvg, svg);
      copyStylesInline(
        div,
        this.visContainer.nativeElement.querySelector('.tooltip-container')
      );
    }

    // Serialize the cloned SVG
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const encodedSvgString =
      'data:image/svg+xml;base64,' +
      btoa(
        encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('no context');
      return;
    }

    const img = new Image();

    // Set canvas size to SVG size
    canvas.width = width;
    canvas.height = height;

    img.onload = () => {
      // Hide buttons before taking the screenshot
      const buttons =
        this.visContainer.nativeElement.querySelectorAll('button');
      buttons.forEach((button: any) => (button.style.display = 'none'));

      context.fillStyle = '#FFFFFF'; // Set white background
      context.fillRect(0, 0, width, height);

      // Corrected drawImage syntax
      context.drawImage(img, 0, 0, width, height);

      // Restore buttons visibility after drawing
      buttons.forEach((button: any) => (button.style.display = 'block'));

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          this.downloadImage(url, 'chart.jpg');
        }
      }, 'image/jpeg');
    };

    img.src = encodedSvgString;
  }

  private downloadImage(data: string, filename: string): void {
    const a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(data); // Clean up the URL object
  }

  toggleLegend() {
    this.legendVisible = !this.legendVisible;
  }

  hideLegend() {
    this.legendVisible = false;
  }

  toggleTooltips() {
    this.tooltipsVisible = !this.tooltipsVisible;
  }

  private onResizeEnd(): void {
    this._init();
  }

  ngOnDestroy() {
    this.selectedCarriersSub.unsubscribe();
    this.currentTabSub.unsubscribe();
    window.removeEventListener('resize', this.debouncedResizeHandler);
  }
}

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: any;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function copyStylesInline(destinationNode: Node, sourceNode: Node) {
  const containerElements = ['svg', 'g'];

  for (let cd = 0; cd < destinationNode.childNodes.length; cd++) {
    const child = destinationNode.childNodes[cd];
    const sourceChild = sourceNode.childNodes[cd];

    if (containerElements.indexOf(child.nodeName) !== -1) {
      copyStylesInline(child, sourceChild);
      continue;
    }

    if (child instanceof Element && sourceChild instanceof Element) {
      const computedStyle = window.getComputedStyle(sourceChild);
      if (computedStyle === null) {
        continue;
      }

      for (let i = 0; i < computedStyle.length; i++) {
        const key = computedStyle[i];
        (child as any).style.setProperty(
          key,
          computedStyle.getPropertyValue(key),
          computedStyle.getPropertyPriority(key)
        );
      }
    }
  }
}
