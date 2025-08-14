import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { IiifTile } from '../service/tile-source.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  server = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getData<T>(
    query: string,
    dbName: string = environment.defaultDbName
  ): Observable<T> {
    const url = environment.apiUrl;
    const body = { query, dbName };
    return this.http.post<T>(url, body).pipe(
      catchError((error: unknown) => {
        console.error('Error:', error, 'For query:', query);
        return throwError(error);
      })
    );
  }

  getDataAs$<R, M>(Ctor: { new (r: R): M; tableName?: string }, query?: string): Observable<M[]> {
    if (!Ctor.tableName && !query) {
      throw new Error('The class passed must have a tableName property if no query is passed. Add the property in your class model or pass a query.');
    }
    const sql = query ?? `SELECT * FROM ${Ctor.tableName };`;

    return this.getData<R | R[]>(sql).pipe(
      map(d => (Array.isArray(d) ? d : [d])),
      map(arr => arr.map(item => new Ctor(item)))
    );
  }

  updateData<T>(query: string, data: T): Observable<T> {
    const url = environment.apiUrl;
    const body = { query, data };
    return this.http.put<T>(url, body).pipe(
      catchError((error: any) => {
        console.error('Error:', error, 'For query:', query);
        return throwError(error);
      })
    );
  }

  createData<T>(query: string): Observable<T> {
    const url = environment.apiUrl;
    const body = { query };
    return this.http.post<T>(url, body).pipe(
      catchError((error: any) => {
        console.error('Error:', error, 'For query:', query);
        return throwError(error);
      })
    );
  }

  getIIIFinfo(url: string): Observable<IiifTile> {
    return this.http.get<IiifTile>(url).pipe(
      map((response) => {
        // Rename the '@id' property to 'id'
        const renamed = renameProperty(response, '@id', 'id');

        // Sort the sizes array based on width
        if (renamed.sizes) {
          renamed.sizes.sort((a: any, b: any) => a.width - b.width);
        }
        return renamed;
      })
    );
  }

  deleteData(query: string): Observable<any> {
    const url = `${environment.apiUrl}/delete`;
    const body = { query };
    return this.http.post(url, body).pipe(
      map((response) => {
        return response;
      }),
      catchError((error: any) => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }
}

function renameProperty(obj: any, from: string, to: string): any {
  if (from === to) {
    return obj;
  }

  if (!obj.hasOwnProperty(from)) {
    return obj;
  }

  obj[to] = obj[from];
  delete obj[from];
  return obj;
}
