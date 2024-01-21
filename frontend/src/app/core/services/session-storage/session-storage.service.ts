import { Injectable } from "@angular/core";

/**
 * Gets a reference to the browser's window api
 */
declare var window: Window;

/**
* A service for working with session storage. Supports getting, setting, and removing values.
*/
@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

    /**
     * Get an item in session storage.
     * 
     * @param {string} name the name of the item to get
     * @returns {any} the value of the item in session storage (null if the key does not exist)
     */
    public get(name: string): any {
        return window.sessionStorage.getItem(name);
    }

    /**
     * Get all items in the session storage.
     * 
     * @returns {{ name: string, value: string | null }[]} Key value pairs representing the session storage.
     */
    public getAll(): { name: string, value: string | null }[] {
        const result: { name: string; value: string | null; }[] = [];
        const keys = Object.keys(window.sessionStorage);
        keys.forEach((key: string) => {
            result.push({ "name": key, "value": window.sessionStorage.getItem(key) });
        });
        return result;
    }

    /**
     * Create/update an item in session storage.
     * 
     * @param {string} name the name of the item to set
     * @param {any} value the value to set
     */
    public set(name: string, value: any): void {
        window.sessionStorage.setItem(name, value);
    }

    /**
     * Delete an item from session storage.
     * 
     * @param {string} name the name of the item to delete from session storage
     */
    public delete(name: string): void {
        window.sessionStorage.removeItem(name);
    }

    /**
     * Clears session storage.
     */
    public deleteAll(): void {
        window.sessionStorage.clear();
    }
}