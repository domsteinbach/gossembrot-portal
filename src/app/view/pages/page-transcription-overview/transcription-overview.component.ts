import { Component } from '@angular/core';
import { TagRepository } from '../../../data/repository/tag-repository';
import { map, Observable } from 'rxjs';
import { Tag } from '../../../model/tag';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '../../../routeConstants';

@Component({
  selector: 'app-transcription-overview',
  templateUrl: './transcription-overview.component.html',
  styleUrls: ['./transcription-overview.component.scss'],
})
export class TranscriptionOverviewComponent {
  tags$!: Observable<Tag[]>;
  oneTagInDetail = false;

  displayResultAs: 'html' | 'tei-xml' = 'html';

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _tagRepository: TagRepository
  ) {
    const tagParam = this._route.snapshot.paramMap.get(
      RouteConstants.TAG_PARAM
    );
    if (tagParam) {
      this.oneTagInDetail = true;
      this.tags$ = this._tagRepository.getTagsWithExampleBelegstellen(
        null,
        tagParam
      );
    } else {
      // get all tags with example verweise but only 1 each
      this.oneTagInDetail = false;
      this.tags$ = this._tagRepository.getTagsWithExampleBelegstellen(3).pipe(
        // sort tags by amount of example verweise: if there are no example verweise, the tag should be at the end
        map((tags) =>
          tags.sort((a, b) => {
            return b.exampleBelegstellen.length - a.exampleBelegstellen.length;
          })
        )
      );
    }
  }

  onMoreClicked(tag: string) {
    this._router.navigate([RouteConstants.TRANSCRIPTION_OVERVIEW, tag]);
  }

  onBackClicked() {
    this._router.navigate([RouteConstants.TRANSCRIPTION_OVERVIEW]);
  }
}
