import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * A service for working with cookies. Supports getting, setting, and removing cookies.
 */
@Injectable({
    providedIn: 'root'
})
export class CookieService {

    /**
     * Creates the CookieService.
     * 
     * @param document the document to store cookies for (don't worry about setting this, Angular injects this for us)
     */
    constructor(@Inject(DOCUMENT) private document: Document) { }

    /**
     * Retrieve the value of a cookie.
     * 
     * @param {string} name the name of the cookie to retrieve.
     * @returns {string | null} the value of the cookie, or null if the cookie does not exist
     */
    public get(name: string): string | null {
        const cookieValue = this.document.cookie.split(';').map(cookie => cookie.trim()).find(cookie => cookie.startsWith(name + '='));
        return (cookieValue ? cookieValue.split('=')[1] : null);
    }

    /**
     * Get all cookies that are stored.
     * 
     * @returns {{ name: string, value: string | null }[]} an array of key value pairs representing the cookies.
     */
    public getAll(): { name: string, value: string | null }[] {
        const result: { name: string; value: string | null }[] = [];
        console.log(document.cookie);
        document.cookie.split(';').forEach((cookie: string) => {
            const cookieName = cookie.trim().split('=')[0];
            result.push({ name: cookieName, value: this.get(cookieName) });
        });
        return result;
    }

    /**
     * Sets or updates the value of a cookie.
     * 
     * @param {string} name the name of the cookie
     * @param {any} value the value for the cookie to store
     * @param {number} daysToExpire number of days the cookie will be valid for
     */
    public set(name: string, value: any, daysToExpire: number): void {
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
        const expires = "expires=" + expirationDate.toUTCString();
        this.document.cookie = name + "=" + value + "; " + expires + "; path=/";
    }

    /**
     * Removes the cookie with the given name.
     * 
     * @param {string} name the name of the cookie to remove.
     */
    public delete(name: string): void {
        this.document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    /**
     * Clears all cookies which have been set!
     */
    public deleteAll(): void {
        document.cookie.split(';').forEach((cookie: string) => {
            this.delete(cookie.trim().split('=')[0]);
        });
    }
}