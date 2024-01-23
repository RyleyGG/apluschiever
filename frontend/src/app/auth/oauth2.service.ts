import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import { SignInInfo, SignUpInfo, SuccessfulUserAuth } from '../core/models/Auth';
import { LocalStorageService } from '../core/services/local-storage/local-storage.service';

/**
 * A service to handle OAuth2 authentication control flow.
 */
@Injectable({
    providedIn: 'root'
})
export class OAuth2Service {
    private REST_API_SERVER = "http://localhost:8000/";

    constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService) { }

    /**
     * Sign up a new user to the backend.
     * 
     * @param { SignUpInfo } signUpInfo the information to use to register a new user
     * @returns { Observable<any> } the resulting api response as an observable stream
     */
    public sign_up(signUpInfo: SignUpInfo): Observable<any> {
        return this.httpClient.post<any>(this.REST_API_SERVER + "auth/sign_up", signUpInfo).pipe(
            map((res: any) => {
                console.log(res);
                return res;
            }),
            catchError((error: HttpErrorResponse) => {
                // Something went really wrong
                this.localStorageService.delete('access_token');
                this.localStorageService.delete('refresh_token');
                return throwError(() => error);
            })
        );
    }

    /**
     * Sign in to the backend using OAuth2.
     * 
     * @param { SignInInfo } signInInfo the information to use to sign in
     * @returns { Observable<SuccessfulUserAuth> } the resulting api response as an observable stream
     */
    public sign_in(signInInfo: SignInInfo): Observable<SuccessfulUserAuth> {
        this.localStorageService.delete('access_token');
        this.localStorageService.delete('refresh_token');

        return this.httpClient.post<SuccessfulUserAuth>(this.REST_API_SERVER + "auth/sign_in", signInInfo).pipe(
            map((res: SuccessfulUserAuth) => {
                this.localStorageService.set('access_token', res.access_token);
                this.localStorageService.set('refresh_token', res.refresh_token);
                return res;
            }),
            catchError((error: HttpErrorResponse) => {
                // Something went really wrong
                this.localStorageService.delete('access_token');
                this.localStorageService.delete('refresh_token');
                return throwError(() => error);
            })
        );
    }

    /**
     * Clear the tokens from storage, effectively signing out the user.
     */
    public sign_out(): void {
        // TODO: Implement this logic.
        // Should this ping a sign out route? None is currently there. 
        this.localStorageService.delete('access_token');
        this.localStorageService.delete('refresh_token');
        // navigate the router to the login or main landing page??
    }

    /**
     * Refreshes the users access tokens. 
     * 
     * @returns { Observable<SuccessfulUserAuth> } the resultin api response as an observable stream
     */
    public refresh_token(): Observable<SuccessfulUserAuth> {
        return this.httpClient.post<SuccessfulUserAuth>(this.REST_API_SERVER + "auth/refresh", this.localStorageService.get('refresh_token')).pipe(
            map((res: SuccessfulUserAuth) => {
                this.localStorageService.set('access_token', res.access_token);
                this.localStorageService.set('refresh_token', res.refresh_token);
                return res;
            }),
            catchError((error: HttpErrorResponse) => {
                // Token is invalid or user is unauthorized.
                this.localStorageService.delete('access_token');
                this.localStorageService.delete('refresh_token');
                return throwError(() => error);
            })
        );
    }

    /**
     * Verifies the user's access tokens are valid. DOES NOT REFRESH ANY TOKENS.
     * 
     * @returns { Observable<boolean> } an observable which will emit the boolean value true if verified and false if not.
     */
    public verify_token(): Observable<boolean> {
        return this.httpClient.post<any>(this.REST_API_SERVER + "auth/verify", {}).pipe(
            map((res: any) => {
                return true;
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('HTTP error:', error);
                return of(false);
            })
        )
    }
}