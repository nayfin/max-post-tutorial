import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthData } from './auth-data.model';
import { BehaviorSubject, of } from 'rxjs';
import { map, catchError, concatMap } from 'rxjs/operators';

export interface User {
  email: string;
  id?: string;
  _id?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  message: string;
  expiresIn: number;
  user: User;
}

const baseUrl = 'http://localhost:3000/api/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _token: string;
  private tokenTimer: any;

  user$: BehaviorSubject<User> = new BehaviorSubject(null);

  get isAuthenticated() {
    return !!this.user$.value;
  }

  get token() {
    return this._token;
  }
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  registerUser( email: string, password: string ) {
    const authData: AuthData = { email: email, password: password};
    return this.http.post<AuthResponse>(`${baseUrl}/register`, authData)
      .pipe(
        concatMap( () => this.loginUser(email, password) )
        // TODO: should be able to dump this. if no bugs found by 7/20/18
        // map( (authResponse: AuthResponse) => {
        //   console.log('check for loggin on registration error');
        //   return {...authResponse.user, id: authResponse.user._id };
        // })
      );
  }

  loginUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password};
    return this.http.post<AuthResponse>(`${baseUrl}/login`, authData)
      .pipe(
        map( (authResponse: AuthResponse) => {
          if (authResponse.token) {
            // user
            const user = {...authResponse.user, id: authResponse.user._id };
            // now
            const now = new Date();
            // milliseconds until expiration of token
            const expiresMillis = authResponse.expiresIn * 1000;
            // save when token expires as Date
            const tokenExpiration = new Date(now.getTime() + expiresMillis);
            // logout user after all expiresMillis have elapsed
            this.setAuthTimer(expiresMillis);
            // set token
            this._token = authResponse.token;
            // inform user$ subject of update to value
            this.user$.next(user);
            // save to localStorage
            this.saveAuthData( this.token, tokenExpiration, user );
            // go home
            this.router.navigate(['']);
            return this.token;
          }
          return false;
        }),
        catchError( error =>  {
          console.log('login error: ', error);
          return of(error);
        } ),
      );
  }

  autoAuthData() {
    const authData = this.getAuthData();
    if (!authData) {
      return;
    }
    const now = new Date();
    const expiresIn = authData.expirationDate.getTime() - now.getTime();
    // console.log('expiresIn', expiresIn);
    if ( expiresIn > 0) {
      this._token = authData.token;
      // this.user$.next({email: 'fakeStaticEmail', id: 'howDoWeGetTheId'});
      console.log('expiresIn', expiresIn );
      this.setAuthTimer( expiresIn );
    }
  }

  logoutUser() {
    this.user$.next(null);
    this._token = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['']);
  }

  private setAuthTimer(duration: number) {
    console.log('setting authTimer', duration);
    this.tokenTimer = setTimeout( ( ) => {
      this.logoutUser();
    }, duration );
  }
  private saveAuthData( token: string, expirationDate: Date, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString() );
    localStorage.setItem('user', JSON.stringify(user) );
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData() {
      const token = localStorage.getItem('token');
      const expirationDate = localStorage.getItem('expiration');
      const user = JSON.parse(localStorage.getItem('user'));
      // this._token = token;
      if ( !token || !expirationDate ) {
        return null;
      }
      this.user$.next(user);
      return {
        token: token,
        expirationDate: new Date(expirationDate)
      };
  }
}
