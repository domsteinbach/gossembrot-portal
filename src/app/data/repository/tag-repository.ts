import { Injectable } from "@angular/core";
import { DataService } from "../dataservice.service";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { Tag } from "../../model/tag";
import { BelegstelleRepository } from "./belegstelle-repository";

@Injectable({
  providedIn: "root",
})
export class TagRepository {
  constructor(
    private _dataService: DataService,
    private _br: BelegstelleRepository,
  ) {}

  // get all tags with real data example verweise for each tag
  public getTagsWithExampleBelegstellen(
    amount?: number | null,
    tag = "",
  ): Observable<Tag[]> {
    return this._tags$(tag).pipe(
      switchMap((tags: Tag[]) => {
        // create the tags array

        const belegstellenObservables = tags.map((tag) =>
          this._br.getBelegstellenWithTag(tag.startTag, amount).pipe(
            catchError((err) => of([])), // If an error occurs, return an empty array for verweise
          ),
        );

        // Use forkJoin to wait for all belegstellen fetches to complete
        return forkJoin(belegstellenObservables).pipe(
          map((allBelegstellen) => {
            tags.forEach((tag, index) => {
              tag.exampleBelegstellen = allBelegstellen[index];
            });
            return tags;
          }),
        );
      }),
    );
  }

  private _tags$(tag?: string): Observable<Tag[]> {
    const tagClause = tag ? `WHERE start_tag = '${tag}'` : "";
    const q = `SELECT * FROM tag ${tagClause} ORDER BY implemented DESC, start_tag ASC;`;

    return this._dataService.getDataAs$(Tag, q).pipe(
      catchError(() => of([])), // Return an empty array in case of an error
    );
  }
}
