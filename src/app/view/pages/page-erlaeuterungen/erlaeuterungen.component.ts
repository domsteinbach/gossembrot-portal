import { Component } from '@angular/core';

@Component({
  selector: 'app-erlaeuterungen',
  templateUrl: './erlaeuterungen.component.html',
  styleUrls: [
    './erlaeuterungen.component.scss',
    '../../shared/tei-render-component/tei-render-component.component.scss',
  ],
})
export class ErlaeuterungenComponent {
  readonly addExample = '<add>...</add>';
  readonly underlineExample = '<underline>unterstrichen</underline>';
  readonly gbExample = '<k><w>grau</w><gb><w>grün</w></gb></k>';
  readonly delExmaple = '<del>durchgestrichen</del>';
  readonly undelExample = '<del undo="true">unterpunktet</del>';
  readonly teiFragExampleHrsg = '<supplied>Kursiv</supplied>';
  readonly teiFragExample = '<frag>:::</frag>';
  readonly teiSicExample = '<sic></sic>';
  readonly teiSymbolExample =
    '<symbol type="Kreis" desc="Kreis"></symbol>';
  readonly teiManiculaExample =
    '<symbol type="Manicula" desc="Manicula"></symbol>';
  readonly teiBuchstabeAExample =
    '<symbol type="letter" desc="A"><w>A</w></symbol>';
  readonly teiBuchstabeBExample =
    '<symbol type="letter" desc="B"><w>B</w></symbol>';
  readonly teiFinisExample = '<finis></finis>';
  readonly teiFinisFullExample = '<finis-full></finis-full>';
}
