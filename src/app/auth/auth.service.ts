import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: NodeJS.Timer;
  private userId: string;
  private myAuthStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.myAuthStatusListener.asObservable();
  }


  createUser(userEmail: string, userPassword: string) {
    const authData: AuthData = {
      email: userEmail,
      password: userPassword
    };
    this.http.post(BACKEND_URL + 'signup', authData)
      .subscribe(
        () => this.router.navigate(['/']),
        error => this.myAuthStatusListener.next(false)
      );
  }

  login(userEmail: string, userPassword: string) {
    const authData: AuthData = {
      email: userEmail,
      password: userPassword
    };
    this.http.post<{token: string, expiresIn: number, userId: string }>(BACKEND_URL + 'login', authData)
    .subscribe( response => {
      const token = response.token;
      this.token = token;
      if (token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = response.userId;
        this.myAuthStatusListener.next(this.isAuthenticated);
        const now = new Date();
        const expirationDate = new Date( now.getTime() + expiresInDuration * 1000 );
        console.log(expirationDate.toLocaleTimeString());
        this.saveAuthData(token, expirationDate, this.userId);
        this.router.navigate(['/']);
      }
    },
    () => this.myAuthStatusListener.next(false));
  }

  authoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return ;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.myAuthStatusListener.next(this.isAuthenticated);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.myAuthStatusListener.next(this.isAuthenticated);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.userId = null;
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);
    this.tokenTimer = setTimeout( () => {
      this.logout();
    }, duration * 1000 );
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const savedToken = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const savedUserId = localStorage.getItem('userId');

    if (!savedToken || !expirationDate) {
      return ;
    }
    return {
      token: savedToken,
      expirationDate: new Date(expirationDate),
      userId: savedUserId
    };
  }
}
