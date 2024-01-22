import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core';
import { SignInInfo, SignUpInfo, SuccessfulUserAuth } from '../core/models/Auth';


export class OAuth2Service {
    private REST_API_SERVER = "http://localhost:8000/";

    constructor(private httpClient: HttpClient) { }

    public sign_up(signUpInfo: SignUpInfo) {
        const OBSERVABLE = this.httpClient.post<any>(this.REST_API_SERVER + "auth/sign_up", signUpInfo);
        return toSignal(OBSERVABLE).asReadonly();
        // make it automatically set tokens
        // make it automatically handle errors
        // make it a signal
    }

    public sign_in(signInInfo: SignInInfo) {
        //remove tokens? 

        const OBSERVABLE = this.httpClient.post<SuccessfulUserAuth>(this.REST_API_SERVER + "auth/sign_in", signInInfo);
        return toSignal(OBSERVABLE).asReadonly();
        // make it automatically set tokens
        // make it automatically handle errors
        // make it a signal
    }

    public sign_out(): void {
        //remove tokens
    }
}