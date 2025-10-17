import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenSubject: BehaviorSubject<string | null>;
  public token: Observable<string | null>;

  readonly tokenItemKey = 'token';

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    public router: Router
  ) {
    this.tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem(this.tokenItemKey));
    this.token = this.tokenSubject.asObservable();
  }

  public get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    const dbName: string = environment.defaultDbName;
    return this.http.post<any>(`${environment.apiUrl}/login`, { username, password, dbName})
      .pipe(map(response => {
        if (response && response.token) {
          localStorage.setItem(this.tokenItemKey, response.token);
          this.tokenSubject.next(response.token);
        }
        return response;
      }));
  }

  logout(): void {
    localStorage.removeItem(this.tokenItemKey);
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {

    const token = localStorage.getItem(this.tokenItemKey);
    return token != null && !this.jwtHelper.isTokenExpired(token);
  }

  public getDecodedAccessToken()  {
    const token = localStorage.getItem(this.tokenItemKey);
    return token ? this.jwtHelper.decodeToken(token) : null;
  }
}
