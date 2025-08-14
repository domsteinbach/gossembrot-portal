import { Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
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

  public getTextsWithOutgoingVerweiseOfCarrier$(
    carrierId: string,
    selfVerweise = true,
    includeNennungen = false
  ): Observable<CarrierText[]> {

    const outgoingVerweise$: Observable<DisplayVerweis[]> =
      this._vr.outgoingVerweiseFromCarrier$(carrierId, includeNennungen);

    const sourceBelegstellen$: Observable<Belegstelle[]> =
      this._br.getSourceBelegstellenOfCarrier$(carrierId);

    const foreignTargetBelegstellen$: Observable<Belegstelle[]> =
      this._br.foreignTargetBelegstellenOfCarrier$(carrierId);

    const textsOfCarrier$ = this._tr.getCarrierTextsOfCarrier$(carrierId);

    const targetTexts$ = this._tr.getTargetTextsOfSrcCarrier$(carrierId);

    // if Nennungen should not be included, then filter them out by filtering the stream of verweise by verweis.type !== 'Nennung'
    if (!selfVerweise) {
      return this._mergeAllIntoTexts$(
        outgoingVerweise$.pipe(
          map((verweise: DisplayVerweis[]) =>
            verweise.filter((v) => v.targetCar !== carrierId)
          )
        ),
        sourceBelegstellen$,
        foreignTargetBelegstellen$,
        textsOfCarrier$,
        targetTexts$
      );
    } else {
      // return all the verweise including the nennungen
      return this._mergeAllIntoTexts$(
        outgoingVerweise$,
        sourceBelegstellen$,
        foreignTargetBelegstellen$,
        textsOfCarrier$,
        targetTexts$
      );
    }
  }

  // combine and merge the belegstellen, the verweise and the pages
  private _mergeAllIntoTexts$(
    verweise$: Observable<DisplayVerweis[]>,
    srcBelegstellen$: Observable<Belegstelle[]>,
    targetBelegstellen$: Observable<Belegstelle[]>,
    textsOfCarrier$: Observable<CarrierText[]>,
    targetTexts$: Observable<CarrierText[]>
): Observable<CarrierText[]> {
    return combineLatest([
      verweise$,
      srcBelegstellen$,
      targetBelegstellen$,
      textsOfCarrier$,
      targetTexts$
    ]).pipe(
      map(([verweise, srcBelegstellen, targetBelegstellen, texts, targetTexts]) => {

        srcBelegstellen.forEach((bst: Belegstelle) => {
          const verweis = verweise.find((v) => v.srcBelegstelle === bst.id);
          if (verweis) {
            bst.outgoingVerweise.push(verweis);
          }
        });

        verweise.forEach(v => {
          v.srcBelegstelleObj = srcBelegstellen.find(
            (bst) => bst.id === v.srcBelegstelle
          );

          v.targetBelegstelleObj = targetBelegstellen.find(
            (bst) => bst.id === v.targetBelegstelle);

          v.targetTextObj = targetTexts.find(t => t.id === v.targetText);
        })


        for (const t of texts) {
          t.outgoingVerweise = verweise.filter((v) => v.srcText === t.id).sort((a, b) => a.sortInSourceCarrier - b.sortInSourceCarrier);
        }
        return texts;

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

        const verweiseWithTarget = verweise.filter(v => v.targetText && v.insecurity <= 1);
        const verweiseWithoutTarget = verweise.filter(v => !v.targetText && v.insecurity <= 1);

        texts.forEach(t => {
          t.incomingVerweise = verweiseWithTarget.filter(v => v.targetText === t.id);
        });

        // If there are verweise without target, create a NullText instance
        if (verweiseWithoutTarget.length > 0) {
          const nullText = this._tr.createNullText(carrierId, 99999);
          nullText.incomingVerweise = verweiseWithoutTarget;
          texts.push(nullText);
        }

        return texts;
      })
    );
  }


}
