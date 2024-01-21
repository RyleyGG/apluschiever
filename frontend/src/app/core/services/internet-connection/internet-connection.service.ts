import { Injectable, signal } from "@angular/core";

/**
 * Gets a reference to the browser's window api
 */
declare var window: Window;

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
     * Private signal used to montior / update internet connection status based on browser events.
     */
    private isOnlineSignal = signal<boolean>(window.navigator.onLine);

    /**
     * Public readonly signal which is used to monitor internet connection status.
     */
    public readonly isOnline = this.isOnlineSignal.asReadonly();

    /**
     * Initializes the event listeners for the service.
     */
    constructor() {
        window.addEventListener('online', () => this.isOnlineSignal.set(true));
        window.addEventListener('offline', () => this.isOnlineSignal.set(false));
    }
}