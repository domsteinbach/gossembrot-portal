import { Injectable } from '@angular/core';
import {combineLatest, filter, map, Observable} from 'rxjs';
import { DisplayVerweis } from '../model/verweis';
import { VerweisRepository } from '../data/repository/verweis-repository';
import { Belegstelle } from '../model/belegstelle';
import { BelegstelleRepository } from '../data/repository/belegstelle-repository';
import { CarrierText } from '../model/carriertext';
import { CarrierTextRepository } from '../data/repository/carrier-text-repository';

@Injectable({
  providedIn: 'root',
})
export class VerweisService {
  constructor(
    private _vr: VerweisRepository,
    private _br: BelegstelleRepository,
    private _tr: CarrierTextRepository,
  ) {}

  public getOutgoingVerweiseOfCarrier$(
    carrierId: string,
    selfVerweise = true,
    includeErwaehnungen = false
  ): Observable<DisplayVerweis[]> {

    const outgoingVerweise$: Observable<DisplayVerweis[]> =
      this._vr.outgoingVerweiseFromCarrier$(carrierId, includeErwaehnungen);

    const sourceBelegstellen$: Observable<Belegstelle[]> =
      this._getbelegstellenWithOutgoingVerweise$(carrierId, includeErwaehnungen);

    const foreignTargetBelegstellen$: Observable<Belegstelle[]> =
      this._br.foreignTargetBelegstellenOfCarrier$(carrierId);

    const targetTexts$ = this._tr.getTargetTextsOfSrcCarrier$(carrierId);

    // if Erwaehnungen should not be included, then filter them out by filtering the stream of verweise by verweis.type !== 'Erwaehnung'
    if (!selfVerweise) {
      return this._mergeAllIntoVerweise$(
        outgoingVerweise$.pipe(
          map((verweise: DisplayVerweis[]) =>
            verweise.filter((v) => v.targetCar !== carrierId)
          )
        ),
        sourceBelegstellen$,
        foreignTargetBelegstellen$,
        targetTexts$
      );
    } else {
      // return all the verweise including the Erwaehnungen
      return this._mergeAllIntoVerweise$(
        outgoingVerweise$,
        sourceBelegstellen$,
        foreignTargetBelegstellen$,
        targetTexts$
      );
    }
  }


  private _getbelegstellenWithOutgoingVerweise$(carrierId: string, includeErwaehnungen = false) : Observable<Belegstelle[]> {
    const outgoingVerweise$: Observable<DisplayVerweis[]> =
        this._vr.outgoingVerweiseFromCarrier$(carrierId, includeErwaehnungen);

    const sourceBelegstellen$: Observable<Belegstelle[]> =
        this._br.getSourceBelegstellenOfCarrier$(carrierId);

    return combineLatest([outgoingVerweise$, sourceBelegstellen$]).pipe(
        map(([verweise, belegstellen]) => {
            belegstellen.forEach((bst: Belegstelle) => {
                bst.outgoingVerweise = verweise.filter((v) => v.srcBelegstelle === bst.id);
            }
            );
            return belegstellen;
        })
    );
}

  private _mergeAllIntoVerweise$(
    verweise$: Observable<DisplayVerweis[]>,
    srcBelegstellen$: Observable<Belegstelle[]>,
    targetBelegstellen$: Observable<Belegstelle[]>,
    targetTexts$: Observable<CarrierText[]>
): Observable<DisplayVerweis[]> {
    return combineLatest([
      verweise$,
      srcBelegstellen$,
      targetBelegstellen$,
      targetTexts$
    ]).pipe(
      map(([verweise, srcBelegstellen, targetBelegstellen, targetTexts]) => {

        verweise.forEach(v => {
          v.srcBelegstelleObj = srcBelegstellen.find(
            (bst) => bst.id === v.srcBelegstelle
          );
          v.targetBelegstelleObj = targetBelegstellen.find(
            (bst) => bst.id === v.targetBelegstelle);

          v.targetTextObj = targetTexts.find(t => t.id === v.targetText);
        })


        return verweise;

      })
    );
  }

  getTextsWithIncomingVerweise(carrierId: string): Observable<CarrierText[]> {
    return combineLatest([
      this._vr.getVerweisePointingToCarrier$(carrierId),
      this._tr.getCarrierTextsOfCarrier$(carrierId),
      this._br.getBelegStellenPointingToCarrier(carrierId),
      this._br.getTargetBelegstellenOfCarrier$(carrierId),
    ]).pipe(
      map(([verweise, texts, srcBelegstellen, targetBelegstellen]) => {
        verweise.forEach((v: DisplayVerweis) => {
          v.srcBelegstelleObj = srcBelegstellen.find(b => b.id === v.srcBelegstelle);
          v.targetBelegstelleObj = targetBelegstellen.find(b => b.id === v.targetBelegstelle);
        });

        const verweiseWithTarget = verweise.filter(v => (!!v.targetText || !!v.targetBelegstelle) && v.insecurity <= 1);
        const verweiseWithoutTarget = verweise.filter(v => (!v.targetText && !v.targetBelegstelle) && v.insecurity <= 1);

        texts.forEach(t => {
          t.incomingVerweise = verweiseWithTarget.filter(v => v.targetText === t.id);
        });

        // If there are verweise without target, create a NullText instance
        if (verweiseWithoutTarget.length > 0) {
          const nullText = this._tr.createNullText(carrierId, 99999);
          nullText.incomingVerweise = verweiseWithoutTarget;
          texts.push(nullText);
        }

        return texts.filter(t => t.incomingVerweise && t.incomingVerweise.length > 0);
      })
    );
  }


}
