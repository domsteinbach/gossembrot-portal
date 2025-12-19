import { Component } from '@angular/core';
import { RouteConstants } from '../../../routeConstants';

@Component({
  selector: 'app-page-visualisations',
  templateUrl: './page-visualisations.component.html',
  styleUrls: ['./page-visualisations.component.scss'],
})
export class PageVisualisationsComponent {
  navLinks = [
    {
      label:
        'Netzwerkdiagramme (zeigen die Verweise in Gossembrots Handschriften an)',
      path: `./${RouteConstants.FORCE_DIRECTED}`,
    },
    /*{
      label: 'Hierarchical Edge Diagram',
      path: `./${RouteConstants.HIERARCHICAL_EDGE_DIAGRAM}`,
    },
    { label: 'Directed Chord', path: `./${RouteConstants.DIRECTED_CHORD}` },

     */
  ];
}
