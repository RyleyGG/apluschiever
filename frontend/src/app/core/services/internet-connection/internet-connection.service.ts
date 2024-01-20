import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

/**
 * Gets a reference to the browser's window api
 */
declare var window: any;

/**
 * A service which allows components to view internet connection status according to the browser. 
 * This service wraps the Window online event (https://developer.mozilla.org/en-US/docs/Web/API/Window/online_event).
 * 
 * Firewalls may mess up some of this functionality.
 */
@Injectable({
    providedIn: 'root'
})
export class InternetConnectionService {
    /**
     * Stores if connected to the internet or not.
     */
    private isOnline$ = new BehaviorSubject<boolean>(window.navigator.onLine);

    /**
     * Initializes the event listeners for the service.
     */
    constructor() {
        window.addEventListener('online', () => this.isOnline$.next(true));
        window.addEventListener('offline', () => this.isOnline$.next(false));
    }

    /**
     * Tell if connected to the network/internet at this instant.
     * 
     * @returns {boolean} true if connected to the internet, false if not.
     */
    public getConnectionStatus(): boolean {
        return this.isOnline$.getValue();
    }

    /**
     * Observe the network/internet connection status for any future changes.
     * 
     * @returns {Observable<boolean>} an observable which will emit true when connected and false when not.
     */
    public observeConnectionStatus(): Observable<boolean> {
        return this.isOnline$.asObservable();
    }
}