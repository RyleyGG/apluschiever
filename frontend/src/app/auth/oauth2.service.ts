import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { SignInInfo, SignUpInfo, SuccessfulUserAuth } from '../core/models/Auth';


@Injectable({
    providedIn: 'root'
})
export class OAuth2Service {
    private REST_API_SERVER = "http://localhost:8000/";

    constructor(private httpClient: HttpClient) { }

    public async sign_up(signUpInfo: SignUpInfo) {
        try {
            const res = await firstValueFrom(this.httpClient.post<any>(this.REST_API_SERVER + "auth/sign_up", signUpInfo));
        } catch (error) {
            throw error;
        }
    }

    public async sign_in(signInInfo: SignInInfo) {
        //remove tokens? 
        try {
            const res = await firstValueFrom(this.httpClient.post<SuccessfulUserAuth>(this.REST_API_SERVER + "auth/sign_in", signInInfo));
            // use localstorage to store the access token and possibly refresh tokens
        } catch (error) {
            throw error;
        }
    }

    public async sign_out(): Promise<void> {
        // TODO: Implement this logic.
        // Should this ping a sign out route? None is currently there. 
        // use localstorage to remove the access token.
        // navigate the router to the login or main landing page.
    }

    /**
     * Verifies the user access token and that the user is logged in.
     * 
     */
    public async verify_token(): Promise<boolean> {
        try {
            return true; // TODO: Implement this logic.
        } catch (error) {
            // Token is invalid or user is unauthorized.
            return false;
        }
    }
}