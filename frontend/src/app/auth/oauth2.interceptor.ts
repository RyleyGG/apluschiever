import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Observable } from "rxjs";
import { LocalStorageService } from "../core/services/local-storage/local-storage.service";

/**
 * Interceptor to automatically add token to outgoing HTTP requests
 * @param request 
 * @param next 
 * @returns 
 */
export const OAuth2Interceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    // Get from local storage
    const token = inject(LocalStorageService).get('Token');

    // Update the outgoing request (if applicable)
    if (token) {
        request = request.clone({
            setHeaders: {
                Authorization: 'Token ' + token
            }
        });
    }

    return next(request);
}
