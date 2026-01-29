import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { RouteConstants } from "../../../routeConstants";
import { MatTabChangeEvent } from "@angular/material/tabs";

@Component({
  selector: "app-page-data-search",
  templateUrl: "./page-data-search.component.html",
  styleUrls: ["./page-data-search.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDataSearchComponent implements OnInit {
  activeTabIndex = 0;

  navLinks = [
    { label: "Freitextsuche", link: RouteConstants.DATA_SEARCH_SEARCH },
    { label: "Autoren und Autorinnen", link: RouteConstants.DATA_AUTHORS },
    { label: "Texte", link: RouteConstants.DATA_TEXTS },
    { label: "Blätter", link: RouteConstants.DATA_PAGE },
    { label: "Verweise", link: RouteConstants.DATA_VERWEISE },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.firstChild?.url.subscribe(() => {
      const currentUrl = this.router.url.split("/").pop();
      this.activeTabIndex = this.navLinks.findIndex(
        (link) => link.link === currentUrl,
      );
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    const selectedTab = this.navLinks[event.index].link;
    this.router.navigate([selectedTab], { relativeTo: this.route });
  }
}
