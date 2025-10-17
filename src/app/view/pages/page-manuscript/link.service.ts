import { Injectable } from '@angular/core';
import { DisplayVerweis } from '../../../model/verweis';
import { RouteConstants } from '../../../routeConstants';
import { MatDialog } from '@angular/material/dialog';
import { VerweisViewComponent, VerweisViewData } from '../page-verweis-view/verweis-view.component';
import { View } from '../page-verweis-view/verweis-view.types';
import { CarrierText } from '../../../model/carriertext';
import { InformationCarrier } from '../../../model/infoCarrier';

@Injectable({
  providedIn: 'root',
})
export class LinkService {

  constructor(
    private _dialog: MatDialog,
    ) {
  }

  baseUrl = `${window.location.origin}${RouteConstants.GSMB_ROOT}`;

  openSourceCarrierOfVerweis(verweis: DisplayVerweis): void {
    window.open(this.getSrcCarrierRoute(verweis), '_blank');
  }

  openTargetCarrierOfVerweis(verweis: DisplayVerweis): void {
    const r =
      verweis.targetCarPhysicality === 'Available'
        ? this._getExistingTargetRoute(verweis)
        : this.getReconstructedVerweisTargetRoute(verweis);
    window.open(r, '_blank');
  }

  getReconstructedVerweisTargetRoute(verweis: DisplayVerweis): string {

    let routeToNav = '';
    const queryParams = `?${RouteConstants.QUERY_VERWEIS_PARAM}=${verweis.id}`;

    switch (verweis.targetCarPhysicality) {
      case 'Lost':
        if (
          verweis.targetCarObj?.inGsmbsLib &&
          verweis.targetCarObj?.carrierType === 'Manuscript'
        ) {
          routeToNav = `${RouteConstants.RECONSTRUCTION}/${RouteConstants.IN_GSM_VALUE}/${verweis.targetCar}${queryParams}`;
        }
        if (
          !verweis.targetCarObj?.inGsmbsLib &&
          verweis.targetCarObj?.carrierType === 'Manuscript'
        ) {
          routeToNav = `${RouteConstants.RECONSTRUCTION}/${RouteConstants.OUT_GSM_VALUE}/${verweis.targetCar}${queryParams}`;
        }
        if (
          verweis.targetCarObj?.inGsmbsLib &&
          verweis.targetCarObj?.carrierType === 'Print'
        ) {
          routeToNav = `${RouteConstants.RECONSTRUCTION}/${RouteConstants.PRINTS_VALUE}/${verweis.targetCar}${queryParams}`;
        }
        break;
      case 'Classic':
        routeToNav = `${RouteConstants.CLASSICS}/${verweis.targetCar}${queryParams}`;
        break;
      default:
        break;
    }
    return routeToNav ? `${this.baseUrl}${routeToNav}` : '';
  }

  getSrcCarrierRoute(verweis: DisplayVerweis): string {
    const qParams = `?${RouteConstants.QUERY_VERWEIS_PARAM}=${verweis.id}`;
    return `${this.baseUrl}${RouteConstants.MANUSCRIPTS}/${verweis.srcCar}${qParams}`;
  }

  getSrcTextRoute(verweis: DisplayVerweis): string {
    const qText = verweis.srcText
      ? `?${RouteConstants.QUERY_CARRIERTEXT_PARAM}=${verweis.srcText}`
      : '';
    return `${this.baseUrl}${RouteConstants.MANUSCRIPTS}/${verweis.srcCar}${qText}`;
  }

  openCarrierInNewTab(carrier: InformationCarrier): void {
    window.open(this._getCarrierRoute(carrier), '_blank');
  }

  openTextInNewTab(text: CarrierText): void {
    if (!text.carrier) {
      console.error('Carrier information is missing for the text:', text);
      return;
    }
    const baseRoute = this._getCarrierRoute(text.carrier);
    window.open(`${baseRoute}?${RouteConstants.QUERY_CARRIERTEXT_PARAM}=${text.id}`, '_blank');
  }

  openInVerweisSynopsis(verweis: DisplayVerweis) {
    const qParams = verweis.id
      ? `?${RouteConstants.QUERY_VERWEIS_PARAM}=${verweis.id}`
      : '';
    const r = `${this.baseUrl}${RouteConstants.VERWEIS}/${qParams}`;
    window.open(r, '_blank');
  }

  private _getExistingTargetRoute(verweis: DisplayVerweis): string {
    const page = verweis.targetBelegstelleObj?.pageId ? verweis.targetBelegstelleObj.pageId : verweis.targetBelegstelleObj?.alternativePageId || '';
    const qPage = page ? `?${RouteConstants.QUERY_PAGE_PARAM}=${page}` : '';
    return `${this.baseUrl}${RouteConstants.MANUSCRIPTS}/${verweis.targetCar}${qPage}`;
  }

  openVerweisViewDialog(verweis: DisplayVerweis, view: View, hideSynopsisButton = false): void {

    const verweisViewData: VerweisViewData = {
      verweis,
      view,
      hideSynopsisButton
    }

    this._dialog.open(VerweisViewComponent, {
      data: verweisViewData,
      autoFocus: false,
      height: '90vh',
      width: '90vw',
    });
  }

  private _getCarrierRoute(carrier: InformationCarrier): string {
    let route = `${window.location.origin}${RouteConstants.GSMB_ROOT}`;
    switch (carrier.physicality) {
      case 'Available':
        route = route + `${RouteConstants.MANUSCRIPTS}/${carrier.id}`;
        break;
      case 'Lost':
        if (carrier.inGsmbsLib && carrier.carrierType === 'Manuscript') {
          route = route + `${RouteConstants.RECONSTRUCTION}/${RouteConstants.IN_GSM_VALUE}/${carrier.id}`;
        } else if (!carrier.inGsmbsLib && carrier.carrierType === 'Manuscript') {
          route = route + `${RouteConstants.RECONSTRUCTION}/${RouteConstants.OUT_GSM_VALUE}/${carrier.id}`;
        } else {
          route = route + `${RouteConstants.RECONSTRUCTION}/${RouteConstants.PRINTS_VALUE}/${carrier.id}`;
        }
        break;
      case 'Classic':
        route = route + `${RouteConstants.CLASSICS}/${carrier.id}`;
        break;
    }
    return route;
  }
}
