import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ManuscriptComponent } from "./view/pages/page-manuscript/manuscript.component";
import { RouteConstants } from "./routeConstants";
import { HomeComponent } from "./view/pages/page-home/home.component";
import { IncomingVerweiseMenuComponent } from "./view/pages/page-incoming-verweise/incoming-verweise-menu.component";
import { ErlaeuterungenComponent } from "./view/pages/page-erlaeuterungen/erlaeuterungen.component";
import { TranscriptionOverviewComponent } from "./view/pages/page-transcription-overview/transcription-overview.component";
import { authGuard } from "./auth/auth.guard";
import { LoginComponent } from "./auth/login/login.component";
import { NetworkGraphComponent } from "./view/pages/page-visualisations/network-graph/network-graph.component";
import { PageClassicsComponent } from "./view/pages/page-classics/page-classics.component";
import { InGsmbComponent } from "./view/pages/page-incoming-verweise/in-gsmb/in-gsmb.component";
import { OutGsmbComponent } from "./view/pages/page-incoming-verweise/out-gsmb/out-gsmb.component";
import { PrintsComponent } from "./view/pages/page-incoming-verweise/prints/prints.component";
import { PageDataSearchComponent } from "./view/pages/page-data-search/page-data-search.component";
import { VerweisSynopsisComponent } from "./view/pages/page-verweis-synopsis/verweis-synopsis.component";
import { AuthorSearchComponent } from "./view/pages/page-data-search/page-author-search/page-author-search.component";
import { DataSearchSearchComponent } from "./view/pages/page-data-search/page-data-search-search/data-search-search.component";
import { NonHabeoComponent } from "./view/pages/page-incoming-verweise/non-habeo/non-habeo.component";

const routes: Routes = [
  {
    path: RouteConstants.HOME,
    component: HomeComponent,
    pathMatch: "full",
  },
  {
    path: RouteConstants.ERLAEUTERUNGEN,
    component: ErlaeuterungenComponent,
    pathMatch: "full",
  },
  {
    path: RouteConstants.MANUSCRIPTS,
    component: ManuscriptComponent,
    children: [
      {
        path: `:${RouteConstants.INFO_CARRIER_PARAM}`,
        component: ManuscriptComponent,
      },
    ],
  },
  {
    path: RouteConstants.VERWEIS,
    component: VerweisSynopsisComponent,
  },
  {
    path: RouteConstants.RECONSTRUCTION,
    component: IncomingVerweiseMenuComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: RouteConstants.IN_GSM_VALUE,
      },
      {
        path: RouteConstants.IN_GSM_VALUE,
        component: InGsmbComponent,
      },
      {
        path: `${RouteConstants.IN_GSM_VALUE}/:${RouteConstants.INFO_CARRIER_PARAM}`,
        component: InGsmbComponent,
      },
      {
        path: RouteConstants.OUT_GSM_VALUE,
        component: OutGsmbComponent,
      },
      {
        path: `${RouteConstants.OUT_GSM_VALUE}/:${RouteConstants.INFO_CARRIER_PARAM}`,
        component: OutGsmbComponent,
      },
      {
        path: RouteConstants.PRINTS_VALUE,
        component: PrintsComponent,
      },
      {
        path: `${RouteConstants.PRINTS_VALUE}/:${RouteConstants.INFO_CARRIER_PARAM}`,
        component: PrintsComponent,
      },
      {
        path: RouteConstants.NON_HABEO_VALUE,
        component: NonHabeoComponent,
      },
      {
        path: `${RouteConstants.NON_HABEO_VALUE}/:${RouteConstants.INFO_CARRIER_PARAM}`,
        component: NonHabeoComponent,
      },
    ],
  },
  {
    path: RouteConstants.CLASSICS,
    component: PageClassicsComponent,
  },
  {
    path: `${RouteConstants.CLASSICS}/:${RouteConstants.INFO_CARRIER_PARAM}`,
    component: PageClassicsComponent,
  },
  {
    path: RouteConstants.TRANSCRIPTION_OVERVIEW,
    canActivate: [authGuard],
    component: TranscriptionOverviewComponent,
  },
  {
    path: `${RouteConstants.TRANSCRIPTION_OVERVIEW}/:${RouteConstants.TAG_PARAM}`,
    canActivate: [authGuard],
    component: TranscriptionOverviewComponent,
  },
  {
    path: `${RouteConstants.VISUALISATIONS}`,
    component: NetworkGraphComponent,
  },
  {
    path: RouteConstants.DATA_SEARCH,
    component: PageDataSearchComponent,

    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: RouteConstants.DATA_SEARCH_SEARCH,
      },
      {
        path: RouteConstants.DATA_SEARCH_SEARCH,
        pathMatch: "full",
        component: DataSearchSearchComponent,
      },
      {
        path: RouteConstants.DATA_AUTHORS,
        pathMatch: "full",
        component: AuthorSearchComponent,
      },
      {
        path: RouteConstants.DATA_TEXTS,
        component: PageDataSearchComponent,
      },
      {
        path: RouteConstants.DATA_PAGE,
        component: PageDataSearchComponent,
      },
      {
        path: RouteConstants.DATA_VERWEISE,
        component: PageDataSearchComponent,
      },
    ],
  },
  { path: "login", component: LoginComponent },

  // { path: RouteConstants.VERWEISE, component: VerweisComponent },
  // { path: RouteConstants.THEMES, component: ThemeSwitchComponent },
  // { path: '**', redirectTo: RouteConstants.HOME }  // for any other routes
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
