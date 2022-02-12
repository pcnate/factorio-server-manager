import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { first, interval, Observable, Subscription } from 'rxjs';
import { SocketService } from './socket.service';

const LOCALSTORAGE_TOKEN_KEY = 'userToken';

interface LoginResponse {
  body: LoginResponseBody;
}

interface LoginResponseBody {
  token?: string;
  error: string|boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  token: string|undefined;
  checkTokenOnInterval: Subscription;

  constructor(
    private socket: SocketService,
    private jwtHelper: JwtHelperService,
    private router: Router,
  ) {
    // get any previous token 
    this.token = window.localStorage.getItem( LOCALSTORAGE_TOKEN_KEY ) || undefined;

    // verify the current session
    if ( this.token ) {
      this.checkToken();
    }
    
    // set an interval to check the session periodically
    this.checkTokenOnInterval = interval( 10000 ).subscribe( () => {
      this.checkToken();
    })
  }


  /**
   * check if the user is signed in with a valid session
   * 
   * @returns whether the user is currently signed in
   */
  public isAuthenticated(): boolean {
    return !!this.token;
  }


  /**
   * check the user credentials
   * 
   * @param username
   * @param password
   * @returns error message
   */
  public checkLogin( username: string, password: string ): Observable<string|boolean> {
    return new Observable<string|boolean>( observer => {
      let error: boolean | string = false;
      this.socket.makeRequest( 'login', { username, password } ).subscribe( ( data: LoginResponse ) => {
        error = data.body.error;
        if ( !!data?.body?.token ) this.authenticate( data?.body?.token );
      })
      observer.next( error );
    }).pipe( first() );
  }


  /**
   * check that the token is valid
   */
  checkToken(): void {
    if( !!this.token ) {
      return;
    }

    console.log( 'checking if token is valid' );

    if ( this.jwtHelper.isTokenExpired( this.token ) ) {
      this.logout();
    }

  }


  /**
   * save the token in localstorage and trigger authentication
   * 
   * @param token JWT token
   */
  private authenticate( token: string ): void {
    this.token = token;
    window.localStorage.setItem( LOCALSTORAGE_TOKEN_KEY, token );
    this.router.navigate(['/']);
  }


  /**
   * deauthenticate the current session
   */
  public logout(): void {
    this.token = undefined;
    window.localStorage.removeItem( LOCALSTORAGE_TOKEN_KEY );
  }
}
