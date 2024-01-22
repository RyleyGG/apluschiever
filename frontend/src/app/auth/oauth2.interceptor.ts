import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


/**
 * Interceptor to add authorization token to outgoing HTTP requests
 */
@Injectable({
    providedIn: 'root'
})
export class OAuth2Interceptor implements HttpInterceptor {

    constructor(/*private localStorageService: LocalStorageService*/) { }

    /**
     * Intercept the HTTP request and add the authorization token if available in local storage.
     * @param {HttpRequest<unknown>} request - The original HTTP request.
     * @param {HttpHandler} next - The next HTTP handler in the chain.
     * @returns {Observable<HttpEvent<unknown>>} An observable of the HTTP event.
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // Get from local storage
        const token = ''; //this.localStorageService.get('Token')

        // Update the outgoing request
        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Token ' + token
                }
            })
        }

        return next.handle(request);
    }
}