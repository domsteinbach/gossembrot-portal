import { Injectable, OnDestroy } from '@angular/core';
import { InformationCarrier } from '../../../../model/infoCarrier';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subject,
  Subscription,
  take,
} from 'rxjs';
import { VisualizationRepository } from '../../../../data/repository/visualization-repository';
import { Select } from '@ngxs/store';
import { CarriersState } from '../../../../state/information-carrier-state.service';
import {
  VisualisationNodeLink,
  VisualisationVerweis,
} from '../../../../model/visualisations';
import { VisualisationSettingsService } from './visualisation-settings.service';
import { CarrierText } from '../../../../model/carriertext';
import { VisGlobalFilter } from './visualisation-data/vis-data-interaction/vis-global-filters/vis-global-filters.component';
import { takeUntil } from 'rxjs/operators';

export type InteractionMode = 'info' | 'select' | 'report';

@Injectable({
  providedIn: 'root',
})
export class VisualisationDataService implements OnDestroy {
  private _destroy$ = new Subject<void>();

  private _combinedSubscription: Subscription = new Subscription(); // subscribe to all changes affecting the visualised data

  // Carrier data
  @Select(CarriersState) private allCarriers$!: Observable<
    InformationCarrier[]
  >;
  private carriersWithVerweis$: Observable<InformationCarrier[]> =
    this.allCarriers$.pipe(
      map((carriers) => {
        return carriers.filter(
          (carrier) =>
            carrier.hasIncomingVerweis || carrier.hasOutgoingVerweis
        );
      })
    );

  private _carriersSub: Subscription;
  private _allCarriers: InformationCarrier[] = [];

  private _globalFilterSub = new Subscription();

  // Text data
  private _textDataSub: Subscription = new Subscription();
  private _textToCarrierLinks: VisualisationNodeLink[] = []; // links between carriers and texts

  // The data which is finally visualised
  private _visualisedNodesSubject = new BehaviorSubject<any[]>([]);
  visualisedNodes$: Observable<any[]> =
    this._visualisedNodesSubject.asObservable();

  private _visualisedLinksSubject = new BehaviorSubject<any[]>([]);
  visualisedLinks$: Observable<any[]> =
    this._visualisedLinksSubject.asObservable();

  // the actual involved/filtered carriers: The applied carriers unified with other carriers involved by verweise with
  // The applied carriers. As instances of the applied carrier selection might have verweise/links
  // to other carriers, which are not selected/applied, there are carriers which must be displayed even if
  // they are not selected! Also if a carrier, which is not selected/applied, but pointing/linking to an applied carrier
  // it must be included. These partially involved carriers together with the applied carriers are the involved
  // carriers.
  private _involvedCarriersSubject = new BehaviorSubject<InformationCarrier[]>(
    []
  );
  involvedCarriers$: Observable<InformationCarrier[]> =
    this._involvedCarriersSubject.asObservable();

  // APPLIED SELECTIONS

  // either all or the selectedCarriers when applied via applyCarrierSelection()
  private _appliedCarrierSelection = new BehaviorSubject(
    <InformationCarrier[]>[]
  );
  appliedCarrierSelection$: Observable<InformationCarrier[]> =
    this._appliedCarrierSelection.asObservable();

  private _lastSelectedCarrier = new BehaviorSubject(
    <InformationCarrier | null>null
  );
  lastSelectedCarrier$: Observable<InformationCarrier | null> =
    this._lastSelectedCarrier.asObservable();

  private _selectedVerweise = new BehaviorSubject(<any[]>[]);
  selectedVerweise$: Observable<any[]> = this._selectedVerweise.asObservable();

  private _interactionModeSubject = new BehaviorSubject<InteractionMode>(
    'info'
  );
  interactionMode$: Observable<InteractionMode> =
    this._interactionModeSubject.asObservable();

  // currently selected stuff
  private _selectedCarriers = new BehaviorSubject(<InformationCarrier[]>[]);
  selectedCarriers$: Observable<InformationCarrier[]> =
    this._selectedCarriers.asObservable();

  constructor(
    private _visRepo: VisualizationRepository,
    private _visSettings: VisualisationSettingsService
  ) {
    this._carriersSub = this.carriersWithVerweis$
      .pipe(takeUntil(this._destroy$))
      .subscribe((carriers) => {
        this._allCarriers = carriers;
        this._applyCarrierSelection(carriers);
      });

    this._globalFilterSub = this._visSettings.globalFilter$
      .pipe(takeUntil(this._destroy$))
      .subscribe((f) => {
        this._applyGlobalFilter(f);
      });

    this._combinedSubscription = combineLatest(
      this.getInvolvedCarriers$(),
      this._visSettings.granularity$,
      this.appliedCarrierSelection$
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe(([involvedCarriers, granuarity, appliedCarriers]) => {
        switch (granuarity) {
          case 'InformationCarrier':
            this._visualisedNodesSubject.next(involvedCarriers);
            this._setLinkDataForCarrierGranularity();
            break;
          case 'CarrierAndText':
            this._setDataForTextAndCarrierGranularity(involvedCarriers);
            break;
          case 'CarrierText':
            this._setDataForTextGranularity(involvedCarriers);
            break;
          case 'Belegstelle':
            return;
        }
      });
  }

  private _setLinkDataForCarrierGranularity(): void {
    this._visRepo
      .getCarrierToCarrierVerweise()
      .pipe(take(1))
      .subscribe((verweise: VisualisationVerweis[]) => {
        // filter the verweise acc. to the applied selection of carriers
        const verweisLinks = this._softFilterLinksByAppliedNodes(
          verweise,
          this._appliedCarrierSelection.getValue()
        ) || [];
        this._visualisedLinksSubject.next(verweisLinks);
      });
  }

  getInvolvedCarriers$(): Observable<InformationCarrier[]> {
    return combineLatest(
      this.carriersWithVerweis$,
      this.appliedCarrierSelection$,
      this._visRepo.getCarrierToCarrierVerweise()
    ).pipe(
      takeUntil(this._destroy$),
      map(([carriers, carriersToApply, carrierToCarrierVerweise]) => {
        const loadAll =
          carriersToApply.length === this._allCarriers.length ||
          !carriersToApply.length;

        if (loadAll) {
          // return all carriers
          return carriers;
        }

        const involvedLinks: VisualisationVerweis[] =
          this._softFilterLinksByAppliedNodes(
            carrierToCarrierVerweise,
            carriersToApply
          );

        return this.getInvolvedCarriers(carriersToApply, involvedLinks);
      })
    );
  }

  // As there are carriers linking to one of the carriersToApply or being linked by one, but not being
  // in the list of carriersToApply, we need to get those as well as Nodes
  getInvolvedCarriers(carriersToApply: InformationCarrier[], links: any[]) {
    // Because the appliedcarriers have incomign and outgoing links to other carriers/nodes we like to diplay,
    // we need to get them acc. to the links and the settings of the carriers
    const nodesToDisplay = [...carriersToApply];
    const involvedNodes: string[] = this._getDistinctInvolvedNodes(links);
    involvedNodes.forEach((n) => {
      const carIdx: number = this._allCarriers.findIndex((c) => c.id === n);
      if (carIdx > -1 && !nodesToDisplay.some((node) => node.id === n)) {
        nodesToDisplay.push(this._allCarriers[carIdx]);
      }
    });
    return nodesToDisplay;
  }

  private _setDataForTextAndCarrierGranularity(
    involvedCarriers: InformationCarrier[]
  ) {
    this._textDataSub = combineLatest(
      this._visRepo.getTextsHavingAVerweis$(), // simply all texts having a verweis
      this._visRepo.getTextToCarrierLinks(), // simply all text connection to carriers
      this._visRepo.getTextToTextVerweise() // simply all verweise between texts
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        ([textsWithVerweis, textToCarrierLinks, allTextToTextVerweise]) => {
          if (
            !textsWithVerweis.length ||
            !textToCarrierLinks.length ||
            !allTextToTextVerweise.length
          ) {
            return;
          }
          let nodes: any[] = [];
          let links: any[] = [];

          const textsOfInvolvedCarriersWithAnyVerweise: CarrierText[] =
            textsWithVerweis.filter((t: CarrierText) =>
              involvedCarriers.some((c) => c.id === t.carId)
            );

          // filter the verweise by involved nodes, both must exist - target and source
          const verweisLinks: VisualisationVerweis[] =
            this._hardFilterLinksByNodes(
              allTextToTextVerweise,
              textsOfInvolvedCarriersWithAnyVerweise,
              this._appliedCarrierSelection.getValue()
            );

          // merge nodes
          nodes = nodes
            .concat(involvedCarriers)
            .concat(textsOfInvolvedCarriersWithAnyVerweise);

          // filter out links beteween carriers and texts without an existing source or target b
          textToCarrierLinks = textToCarrierLinks.filter((link) => {
            const sourceExists = nodes.some((node) => node.id === link.source);
            const targetExists = nodes.some((node) => node.id === link.target);
            return sourceExists && targetExists;
          });

          // remove textnodes without verweis
          nodes = nodes.filter((n) => {
            return (
              n.nodeType === 0 ||
              n instanceof InformationCarrier ||
              verweisLinks.some((l) => l.target === n.id || l.source === n.id)
            );
          });

          // remove also the nodeLinks
          textToCarrierLinks = textToCarrierLinks.filter((l) => {
            return (
              nodes.findIndex((n) => n.id === l.source) > -1 &&
              nodes.findIndex((n) => n.id === l.target) > -1
            );
          });

          this._visualisedNodesSubject.next(nodes);

          links = links.concat(verweisLinks).concat(textToCarrierLinks);

          this._visualisedLinksSubject.next(links);
        }
      );
  }

  private _setDataForTextGranularity(involvedCarriers: InformationCarrier[]) {
    this._textDataSub = combineLatest(
      this._visRepo.getTextsHavingAVerweis$(), // simply all texts having a verweis
      this._visRepo.getTextToTextVerweise() // simply all verweise between texts
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe(([textsWithVerweis, allTextToTextVerweise]) => {
        if (!textsWithVerweis.length || !allTextToTextVerweise.length) {
          return;
        }
        let nodes: any[] = [];

        // filter the verweise by involved nodes, both must exist - target and source and set the carrier property in the carriertext
        const textsOfInvolvedCarriersWithAnyVerweise: CarrierText[] =
          textsWithVerweis.filter((t: CarrierText) => {
            t.carrier = involvedCarriers.find((c) => c.id === t.carId);
            return t.carrier;
          });

        // filter the verweise by involved nodes, both must exist - target and source
        const verweisLinks: VisualisationVerweis[] =
          this._hardFilterLinksByNodes(
            allTextToTextVerweise,
            textsOfInvolvedCarriersWithAnyVerweise,
            this._appliedCarrierSelection.getValue()
          );

        // remove textnodes without verweis
        nodes = textsOfInvolvedCarriersWithAnyVerweise.filter((n) => {
          return verweisLinks.some(
            (l) => l.target === n.id || l.source === n.id
          );
        });

        this._visualisedNodesSubject.next(nodes);
        this._visualisedLinksSubject.next(verweisLinks);
      });
  }

  private _applyGlobalFilter(f: VisGlobalFilter) {
    if (!this._allCarriers.length) {
      return;
    }
    const carriers = this._allCarriers.filter((carrier) => {
      // Check if the carrier should be included based on the filters
      const matchesLibrary = f.inGsmbBib.some(
        (value) => carrier.inGsmbsLib === value
      );
      const matchesType = f.infoCarrierTypes.includes(carrier.carrierType);
      const matchesPhysicality = f.physicalities.includes(carrier.physicality);

      // Only include the carrier if it matches all the filters
      return matchesLibrary && matchesType && matchesPhysicality;
    });
    // Emit the filtered carriers
    this._appliedCarrierSelection.next(carriers);
  }

  setInteractionMode(tab: InteractionMode) {
    this._interactionModeSubject.next(tab);
  }

  setLastSelectedCarrier(carrier: InformationCarrier) {
    this._lastSelectedCarrier.next(carrier);
  }

  selectCarrier(carrier: InformationCarrier) {
    const carriers = this._selectedCarriers.getValue();
    if (carriers.findIndex((c) => c.id === carrier.id) > -1) {
      // the carrier is already in the selection, just update last selected
      this._lastSelectedCarrier.next(carrier);
      return;
    }
    carriers.push(carrier);
    this._selectedCarriers.next(carriers);
    this._lastSelectedCarrier.next(carrier);
  }

  unselectCarrier(carrier: InformationCarrier) {
    const carriers = this._selectedCarriers.getValue();
    const index = carriers.findIndex((c) => c.id === carrier.id);
    carriers.splice(index, 1);
    this._selectedCarriers.next(carriers);
    if (
      carriers.length === 0 ||
      carrier.id === this._lastSelectedCarrier.getValue()?.id
    ) {
      this._lastSelectedCarrier.next(null);
    }
  }

  selectVerweis(verweis: any | null) {
    const selectedVerweise = this._selectedVerweise.getValue();
    const idx = selectedVerweise.findIndex((v) => v?.index === verweis?.index);

    if (idx > -1) {
      // remove from selection
      selectedVerweise.splice(idx, 1);
    } else {
      selectedVerweise.push(verweis);
    }
    this._selectedVerweise.next(selectedVerweise);
  }

  private _applyCarrierSelection(carriers: InformationCarrier[]) {
    if (!this._selectedCarriers.getValue().length) {
      // there is no selection made, so we set all carriers as node data
      this._appliedCarrierSelection.next(carriers);
      return;
    }
    this._appliedCarrierSelection.next(this._selectedCarriers.getValue());
  }

  getOnlyLinksBetweenSelectedCarriers(verweise: any): any[] {
    return verweise.filter((verweis: any) => {
      return (
        this._selectedCarriers
          .getValue()
          .findIndex((c) => c.id === verweis.source.id) > -1 &&
        this._selectedCarriers
          .getValue()
          .findIndex((c) => c.id === verweis.target.id) > -1
      );
    });
  }

  private _softFilterLinksByAppliedNodes(links: any[], nodes: any[]): any[] {
    return links.filter((link) => {
      const source =
        typeof link.source === 'string' ? link.source : link.source?.id;
      const target =
        typeof link.target === 'string' ? link.target : link.target?.id;
      const sourceExists = nodes.some((node) => node?.id === source);
      const targetExists = nodes.some((node) => node?.id === target);
      return sourceExists || targetExists;
    });
  }

  private _hardFilterLinksByNodes(
    links: any[],
    nodes: any[],
    allowedParents: any[]
  ): any[] {
    return links.filter((link) => {
      const source =
        typeof link.source === 'string' ? link.source : link.source.id;
      const target =
        typeof link.target === 'string' ? link.target : link.target.id;
      const sourceExists = nodes.some((node) => node.id === source);
      const targetExists = nodes.some((node) => node.id === target);
      const sourceHasAllowedParent = allowedParents.some(
        (parent) => parent.id === link.srcParent
      );
      const targetHasAllowedParent = allowedParents.some(
        (parent) => parent.id === link.targetParent
      );
      return (
        sourceExists &&
        targetExists &&
        (sourceHasAllowedParent || targetHasAllowedParent)
      );
    });
  }

  private _filterLinksByAppliedNodesParent(
    links: any[],
    nodesParent: string[]
  ): any[] {
    return links.filter((link) => {
      const source =
        typeof link.source === 'string' ? link.source : link.source.id;
      const target =
        typeof link.target === 'string' ? link.target : link.target.id;
      const sourceExists = nodesParent.some((node) => node === source);
      const targetExists = nodesParent.some((node) => node === target);
      return sourceExists || targetExists;
    });
  }

  private _getDistinctInvolvedNodes(verweisLinks: any): string[] {
    // now update the carriers: include all carriers that are in the links acc. to settings
    const connectedCarriersIds = verweisLinks
      .map((verweis: any) => verweis.source?.id || verweis?.source)
      .concat(
        verweisLinks.map((verweis: any) => verweis?.target?.id || verweis?.target)
      );
    return Array.from(new Set(connectedCarriersIds));
  }

  /*
  LoadAlsoTextNodes() {
    const carriers = this._allCarriers.map((c) => c.id);
    if (!carriers.length) {
      return;
    }
    this._tr
      .getCarrierTextsOfCarriers$(this._allCarriers.map((c) => c.id))
      .pipe(
        take(1),
        tap((texts) => {
          let nodes: any[] = [];
          nodes = nodes.concat(this._allCarriers).concat(texts);
          //this._visualisedNodesSubject.next(this._allCarriers.concat(nodes));
          //this._visualisedLinksSubject.next(this._allVerweise);
        })
      )
      .subscribe();
  }
  */

  hideUnselectedCarriers(hide: boolean) {
    if (hide) {
      this._appliedCarrierSelection.next(this._selectedCarriers.getValue());
    } else {
      this._appliedCarrierSelection.next(this._allCarriers);
    }
  }

  ngOnDestroy() {
    this._combinedSubscription.unsubscribe();
    this._carriersSub.unsubscribe();
    this._globalFilterSub.unsubscribe();
    this._textDataSub.unsubscribe();
    this._destroy$.next();
  }
}
