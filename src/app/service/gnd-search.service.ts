import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GndSearchService {
  private apiUrl = "https://lobid.org/gnd/search";

  constructor(private http: HttpClient) {}

  searchPeopleByName$(name: string, limit = 10): Observable<any> {
    const query = `?q=${name}&filter=type:Person&size=${limit}`;
    return this.http.get(`${this.apiUrl}${query}`);
  }

  searchWorks(limit = 10): Observable<any> {
    const filterQuery = `+(${encodeURIComponent("type:Work")}) +(${encodeURIComponent("type:Manuscript")}) +(${encodeURIComponent('gndSubjectCategory.id:"https://d-nb.info/standards/vocab/gnd/gnd-sc#2.1"')})`;
    const query = `?filter=${filterQuery}&size=${limit}`;
    return this.http.get(`${this.apiUrl}${query}`);
  }
}
