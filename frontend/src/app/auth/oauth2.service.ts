import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, first, firstValueFrom, map, throwError } from 'rxjs';

import { SignInInfo, SignUpInfo, SuccessfulUserAuth } from '../core/models/Auth';
import { LocalStorageService } from '../core/services/local-storage/local-storage.service';


@Injectable({
    providedIn: 'root'
})
export class OAuth2Service {
    private REST_API_SERVER = "http://localhost:8000/";

    constructor(private httpClient: HttpClient, private localStorageService: LocalStorageService) { }

    public async sign_up(signUpInfo: SignUpInfo): Promise<boolean> {
        try {
            const res = await firstValueFrom(this.httpClient.post<any>(this.REST_API_SERVER + "auth/sign_up", signUpInfo));
            console.log(res);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    /**
     * 
     * @param signInInfo 
     * @returns 
     */
    public async sign_in(signInInfo: SignInInfo): Promise<boolean> {
        this.localStorageService.delete('access_token');
        this.localStorageService.delete('refresh_token');

        try {
            const res = await firstValueFrom(this.httpClient.post<SuccessfulUserAuth>(this.REST_API_SERVER + "auth/sign_in", signInInfo));
            this.localStorageService.set('access_token', res.access_token);
            this.localStorageService.set('refresh_token', res.refresh_token);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public sign_out(): void {
        // TODO: Implement this logic.
        // Should this ping a sign out route? None is currently there. 
        this.localStorageService.delete('access_token');
        this.localStorageService.delete('refresh_token');
        // navigate the router to the login or main landing page??
    }

    /**
     * Verifies the user access token and that the user is logged in.
     * 
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
}