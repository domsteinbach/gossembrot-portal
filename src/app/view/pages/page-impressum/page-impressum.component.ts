import { Component } from '@angular/core';
import {EnvConstants} from "../../../constants";

@Component({
  selector: 'app-page-impressum',
  standalone: true,
  imports: [],
  templateUrl: './page-impressum.component.html',
  styleUrl: './page-impressum.component.scss'
})
export class PageImpressumComponent {

  readonly ccByImg = `${EnvConstants.ASSET_IMG_PATH}/cc-by-nc-sa.png`;

}
