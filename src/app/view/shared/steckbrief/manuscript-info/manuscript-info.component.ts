import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { InformationCarrier } from "../../../../model/infoCarrier";
import { Einband } from "../../../../model/einband";

@Component({
  selector: "app-manuscript-info",
  templateUrl: "./manuscript-info.component.html",
  styleUrls: ["./manuscript-info.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManuscriptInfoComponent {
  @Input() infoCarrier!: InformationCarrier;

  get einband(): Einband | undefined {
    if (!this.infoCarrier.einbandInfo?.length) return undefined;
    return this.infoCarrier.einbandInfo[0];
  }

  get einbandId(): string | undefined {
    return this.infoCarrier.einbandInfo?.length
      ? this.infoCarrier.einbandInfo[0].externalEntity?.thirdPartyId
      : undefined;
  }

  get einbandLink(): string | undefined {
    return this.infoCarrier.einbandInfo?.length
      ? this.infoCarrier.einbandInfo[0].externalEntity?.thirdPartyLink
      : undefined;
  }

  get linkToExternalDigitalisat() {
    return this.infoCarrier.externalDigitalisat?.thirdPartyLink;
  }

  get hsPortal() {
    return this.infoCarrier.handschriftenPortal?.thirdPartyLink;
  }

  get hsCensus() {
    return this.infoCarrier.handschriftenCensus?.thirdPartyLink;
  }

  get hsLinkText(): string {
    const linkParts: string[] = [];

    if (this.linkToExternalDigitalisat) {
      linkParts.push(
        `<a href="${this.linkToExternalDigitalisat}" target="_blank" rel="noopener">Digitalisat</a> der Bibliothek`,
      );
    }

    if (this.hsPortal) {
      linkParts.push(
        `<a href="${this.hsPortal}" target="_blank" rel="noopener">Handschriftenportal</a>`,
      );
    }

    if (this.hsCensus) {
      linkParts.push(
        `<a href="${this.hsCensus}" target="_blank" rel="noopener">Handschriftencensus</a>`,
      );
    }

    if (!linkParts.length) {
      return "";
    }

    return `Link zum ${linkParts.join(" und zum ")}.`;
  }
}
