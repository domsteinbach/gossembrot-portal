import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataService } from './data/dataservice.service';
import { HomeComponent } from './view/pages/page-home/home.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ManuscriptComponent } from './view/pages/page-manuscript/manuscript.component';
import { ManuscriptBrowserComponent } from './view/pages/page-manuscript/manuscript-browser/manuscript-browser.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { ManuscriptNavComponent } from './view/pages/page-manuscript/manuscript-nav/manuscript-nav.component';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { OsdViewerComponent } from './view/pages/page-manuscript/manuscript-browser/osd-viewer/osd-viewer.component';
import { BelegstelleSelectComponent } from './view/shared/belegstelle-select/belegstelle-select.component';
import { NgxsModule } from '@ngxs/store';
import { JwtModule } from '@auth0/angular-jwt';
import {
  CarriersState,
  SelectedSrcInformationCarrierState,
} from './state/information-carrier-state.service';
import {
  SelectedCarrierPagesState,
  SelectedCarrierTextState,
  DoubleTileSourcesState,
  DisplayedPagesState,
  SelectedPageState, LocalDoubleTileSourcesState,
} from './state/app-state';

import { GridTilesViewComponent } from './view/pages/page-manuscript/manuscript-browser/grid-tiles-view/grid-tiles-view.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { OsdEditorComponent } from './view/shared/osd-editor/osd-editor.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ManuscriptNavService } from './service/manuscript-nav.service';
import { TextSelectComponent } from './view/pages/page-manuscript/manuscript-nav/text-select/text-select.component';
import { BelegstellenNavComponent } from './view/pages/page-manuscript/manuscript-nav/belegstellen-nav/belegstellen-nav.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { VerweisService } from './service/verweis.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { InfoCarrierSelectComponent } from './view/shared/info-carrier-select/info-carrier-select.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IncomingVerweiseComponent } from './view/shared/incoming-verweise/incoming-verweise.component';
import { HeaderComponent } from './view/pages/page-header/header.component';
import { IncomingVerweiseListComponent } from './view/shared/incoming-verweise-list/incoming-verweise-list.component';
import { LagensymbolComponent } from './view/shared/lagensymbol/lagensymbol.component';
import { DoppelLagensymbolComponent } from './view/pages/page-manuscript/manuscript-browser/doppel-lagensymbol/doppel-lagensymbol.component';
import { TeiRenderComponentComponent } from './view/shared/tei-render-component/tei-render-component.component';
import { TeiElementComponent } from './view/shared/tei-render-component/tei-element-component/tei-element-component.component';
import { IncomingVerweiseMenuComponent } from './view/pages/page-incoming-verweise/incoming-verweise-menu.component';
import { OutgoingVerweiseListComponent } from './view/shared/outgoing-verweise-per-manuscript/outgoing-verweise-list/outgoing-verweise-list.component';
import { OutgoingVerweisePerManuscriptComponent } from './view/shared/outgoing-verweise-per-manuscript/outgoing-verweise-per-manuscript.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ManuscriptInfoComponent } from './view/shared/steckbrief/manuscript-info/manuscript-info.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { DoppellagenInfoTextComponent } from './view/pages/page-manuscript/manuscript-browser/doppellagen-info-text/doppellagen-info-text.component';
import { SteckbriefComponent } from './view/shared/steckbrief/steckbrief.component';
import { ThemeHandlerService } from './service/theme.service';
import { SelectedThemeState } from './state/theme-state';
import { SelectedTargetBelegstelleState, SelectedVerweisState } from './state/belegstelle-state.service';
import { SelectedSrcBelegstelleState } from './state/belegstelle-state.service';
import { ErlaeuterungenComponent } from './view/pages/page-erlaeuterungen/erlaeuterungen.component';
import { TranscriptionOverviewComponent } from './view/pages/page-transcription-overview/transcription-overview.component';
import { MatTableModule } from '@angular/material/table';
import { TagResultComponent } from './view/pages/page-transcription-overview/tag-result/tag-result.component';
import { MatRadioModule } from '@angular/material/radio';
import { VisualizationRepository } from './data/repository/visualization-repository';
import { ForceDirectedGraphComponent } from './view/pages/page-visualisations/network-graph/force-directed-graph/force-directed-graph.component';
import { MtxTooltipModule } from '@ng-matero/extensions/tooltip';
import { LoginComponent } from './auth/login/login.component';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { VisualisationDataComponent } from './view/pages/page-visualisations/network-graph/visualisation-data/visualisation-data.component';
import { VisDataInteractionComponent } from './view/pages/page-visualisations/network-graph/visualisation-data/vis-data-interaction/vis-data-interaction.component';
import { NetworkGraphComponent } from './view/pages/page-visualisations/network-graph/network-graph.component';
import { VisDisplaySettingsComponent } from './view/pages/page-visualisations/network-graph/visualisation-data/vis-data-interaction/vis-display-settings/vis-display-settings.component';
import { VisGlobalFiltersComponent } from './view/pages/page-visualisations/network-graph/visualisation-data/vis-data-interaction/vis-global-filters/vis-global-filters.component';
import { PageClassicsComponent } from './view/pages/page-classics/page-classics.component';
import { InGsmbComponent } from './view/pages/page-incoming-verweise/in-gsmb/in-gsmb.component';
import { OutGsmbComponent } from './view/pages/page-incoming-verweise/out-gsmb/out-gsmb.component';
import { PrintsComponent } from './view/pages/page-incoming-verweise/prints/prints.component';
import { ScrollIntoViewDirective } from './directives/scroll-into-view.directive';
import { VerweisSearchComponent } from './view/pages/page-data-search/page-verweis-search/verweis-search.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { PhysicalityFilterComponent } from './view/pages/page-data-search/page-verweis-search/advanced-verweis-filter/physicality-filter.component';
import { AdvancedVerweisFilterComponent } from './view/pages/page-data-search/page-verweis-search/advanced-verweis-filter/advanced-verweis-filter.component';
import { InfocarTypeFilterComponent } from './view/pages/page-data-search/page-verweis-search/advanced-verweis-filter/infocar-type-filter.component';
import { TargetBlattIsFragmentFilterComponent } from './view/pages/page-data-search/page-verweis-search/advanced-verweis-filter/target-blatt-is-fragment-filter.component';
import { IsErwaehnungFilterComponent } from './view/pages/page-data-search/page-verweis-search/advanced-verweis-filter/is-erwaehnung-filter.component';
import { PageDataSearchComponent } from './view/pages/page-data-search/page-data-search.component';
import { CarrierTextSearchComponent } from './view/pages/page-data-search/page-carrier-text-search/carrier-text-search.component';
import { MatButtonLoading } from '@ng-matero/extensions/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { PageBlattSearchComponent } from './view/pages/page-data-search/page-blatt-search/page-blatt-search.component';
import { TableFilterComponent } from './view/pages/page-data-search/shared/table-filter/table-filter.component';
import { NullFilterComponent } from './view/pages/page-data-search/shared/nullfilter/nullfilter.component';
import { VerweisSynopsisComponent } from './view/pages/page-verweis-synopsis/verweis-synopsis.component';
import { CarrierTextsState } from './state/carriertext-state';
import {
  VerweisViewBlattInfoComponent
} from './view/shared/verweis-view-blatt-info/verweis-view-blatt-info.component';
import { VerweisViewComponent } from './view/pages/page-verweis-view/verweis-view.component';
import {
  VerweisLinkIconComponentComponent
} from './view/shared/verweis-link-icon-component/verweis-link-icon-component.component';
import {
  TargetBlattIsLostFilterComponent
} from './view/pages/page-data-search/page-verweis-search/advanced-verweis-filter/target-blatt-is-lost-filter';
import { LostSnackbarComponent } from './view/shared/lost-snackbar.component';
import { AuthorSearchComponent } from './view/pages/page-data-search/page-author-search/page-author-search.component';
import { HeaderSearchComponent } from './view/pages/page-header/header-search/header-search.component';
import { SearchResultsComponent } from './view/pages/page-header/header-search/search-results/search-results.component';
import {
  SearchResultGroupComponent
} from './view/shared/search-result-group/search-result-group.component';
import {
  SearchResultAuthorComponent
} from './view/shared/search-result-group/search-result-group-components/search-result-authors/search-result-author.component';
import {
  SearchResultBelegstelleComponent
} from './view/shared/search-result-group/search-result-belegstelle/search-result-belegstelle.component';
import { HighlightBoldPipe } from './pipes/highlight-bold';
import { UiCloseButtonComponent } from './view/shared/ui-elements/close-button.component';
import {
  SearchResultCarriertextComponent
} from './view/shared/search-result-group/search-result-group-components/search-result-carriertext.component';
import {
  ShowMoreToggleComponent
} from './view/shared/search-result-group/search-result-group-components/show-more-toggle';
import {
  DataSearchSearchComponent
} from './view/pages/page-data-search/page-data-search-search/data-search-search.component';
import {
  SearchResultsNamingGsmbComponent
} from './view/shared/search-result-group/search-result-group-components/search-results-naming-gsmb.component';
import { BlattSelectComponent } from './view/shared/blatt-select/blatt-select.component';
import { NonHabeoComponent } from './view/pages/page-incoming-verweise/non-habeo/non-habeo.component';
import {environment} from "../environments/environment";
import {waitForSwReadyFactory} from "./sw-ready.initializer";

export function tokenGetter() {
  return localStorage.getItem('token'); // Ensure this matches how you store the token
}

@NgModule({
  declarations: [
    AppComponent,
    AdvancedVerweisFilterComponent,
    AuthorSearchComponent,
    BlattSelectComponent,
    SearchResultAuthorComponent,
    HighlightBoldPipe,
    ScrollIntoViewDirective,
    HomeComponent,
    ManuscriptComponent,
    ManuscriptBrowserComponent,
    ManuscriptNavComponent,
    OsdEditorComponent,
    OsdViewerComponent,
    BelegstelleSelectComponent,
    GridTilesViewComponent,
    TextSelectComponent,
    BelegstellenNavComponent,
    InfoCarrierSelectComponent,
    InfocarTypeFilterComponent,
    IsErwaehnungFilterComponent,
    TargetBlattIsFragmentFilterComponent,
    IncomingVerweiseComponent,
    HeaderComponent,
    IncomingVerweiseListComponent,
    LagensymbolComponent,
    NonHabeoComponent,
    DoppelLagensymbolComponent,
    TeiRenderComponentComponent,
    IncomingVerweiseMenuComponent,
    OutgoingVerweiseListComponent,
    OutgoingVerweisePerManuscriptComponent,
    ManuscriptInfoComponent,
    DoppellagenInfoTextComponent,
    PageClassicsComponent,
    PhysicalityFilterComponent,
    LostSnackbarComponent,
    InGsmbComponent,
    OutGsmbComponent,
    PrintsComponent,
    SteckbriefComponent,
    ErlaeuterungenComponent,
    TranscriptionOverviewComponent,
    TagResultComponent,
    ForceDirectedGraphComponent,
    NetworkGraphComponent,
    PageDataSearchComponent,
    DataSearchSearchComponent,
    CarrierTextSearchComponent,
    ShowMoreToggleComponent,
    SearchResultsComponent,
    SearchResultGroupComponent,
    SearchResultBelegstelleComponent,
    SearchResultCarriertextComponent,
    SearchResultsNamingGsmbComponent,
    HeaderSearchComponent,
    TeiElementComponent,
    TargetBlattIsLostFilterComponent,
    LoginComponent,
    PageBlattSearchComponent,
    UiCloseButtonComponent,
    VerweisLinkIconComponentComponent,
    VerweisSearchComponent,
    VerweisSynopsisComponent,
    VerweisViewComponent,
    VerweisViewBlattInfoComponent,
    VisualisationDataComponent,
    VisDataInteractionComponent
  ],
  imports: [
    NgxsModule.forRoot([
      CarriersState,
      DisplayedPagesState,
      SelectedSrcInformationCarrierState,
      SelectedCarrierTextState,
      CarrierTextsState,
      SelectedCarrierPagesState,
      DoubleTileSourcesState,
      SelectedPageState,
      SelectedSrcBelegstelleState,
      SelectedTargetBelegstelleState,
      SelectedVerweisState,
      SelectedThemeState,
      LocalDoubleTileSourcesState,
    ]),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: ['example.com'], // specify your domain
        disallowedRoutes: ['http://example.com/examplebadroute/'],
      },
    }),
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MatSelectModule,
    MatToolbarModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatBadgeModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatInputModule,
    MatGridListModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatTooltipModule,
    MatListModule,
    MatExpansionModule,
    MtxTooltipModule,
    MatMenu,
    MatMenuTrigger,
    VisDisplaySettingsComponent,
    VisGlobalFiltersComponent,
    MatButtonLoading,
    MatProgressBar,
    MatProgressSpinner,
    TableFilterComponent,
    NullFilterComponent,
    MatMenuItem,
  ],
  providers: [
    DataService,
    ManuscriptNavService,
    VerweisService,
    ThemeHandlerService,
    VisualizationRepository,
    ...(environment.useSqlJs ? [{
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: waitForSwReadyFactory
    }] : [])
  ],
  bootstrap: [AppComponent],
  exports: [
    OsdEditorComponent,
    HighlightBoldPipe,
    ManuscriptNavComponent,
  ],
})
export class AppModule {

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
      'manuscript-view',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/man.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'split-view',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/split.svg')
    );
  }
}
