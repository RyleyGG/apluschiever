import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Injector, inject, runInInjectionContext } from "@angular/core";
import { Observable, catchError, map, mergeMap, switchMap, throwError } from "rxjs";
import { LocalStorageService } from "../core/services/local-storage/local-storage.service";
import { OAuth2Service } from "./oauth2.service";
import { SuccessfulUserAuth } from "../core/models/auth.interface";

/**
 * Interceptor to automatically add token to outgoing HTTP requests
 * @param { HttpRequest<unknown> } request the original request
 * @param { HttpHandlerFn } next the handler function
 * @returns { Observable<HttpEvent<unknown>> } the observable for the request response
 */
export const OAuth2Interceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    // Angular can only inject within certain contexts,
    // so here we grab the services so we can pass them to other functions
    const localStorageService = inject(LocalStorageService);
    const authService = inject(OAuth2Service);

    // Get token from local storage
    const token = localStorageService.get('access_token');
    if (token) {
        request = AddTokenHeader(request, token);
    }

    // Check the response to see if automatic token refresh should be attempted
    return next(request).pipe(
        catchError((error: any) => {
            if (error.status === 401) {
                return HandleRefreshToken(request, next, localStorageService, authService);
            }
            return throwError(() => error);
        })
    );
}

/**
 * A helper function to the OAuth2Interceptor to automatically refresh tokens
 * @param { HttpRequest<unknown> } request the original request
 * @param { HttpHandlerFn } next the handler function
 * @param { LocalStorageService } localStorageService the localStorageService instance to use
 * @param { OAuth2Service } authService the OAuth2Service instance to use
 * @returns { Observable<HttpEvent<unknown>> } 
 */
const HandleRefreshToken = (request: HttpRequest<unknown>, next: HttpHandlerFn, localStorageService: LocalStorageService, authService: OAuth2Service): Observable<HttpEvent<unknown>> => {
    return authService.refresh_token().pipe(
        mergeMap((data: SuccessfulUserAuth) => {
            // Retry the request after the refresh
            const token = localStorageService.get('access_token');
            if (token) {
                request = AddTokenHeader(request, token);
            }
            return next(request);
        }),
        catchError((error: HttpErrorResponse) => {
            authService.sign_out();
            return throwError(() => error);
        })
    );
}

/**
 * A helper function to the OAuth2Interceptor to add the oken to the request headers.
 * 
 * @param { HttpRequest<unknown> } request the request to add the token to
 * @param { string } token the token to add
 * @returns { HttpRequest<unknown> } the new request
 */
const AddTokenHeader = (request: HttpRequest<unknown>, token: string): HttpRequest<unknown> => {
    return request.clone({
        setHeaders: {
            Authorization: 'Bearer ' + token
        }
    });
}