import { Injectable } from "@angular/core";

/**
 * Gets a reference to the browser's window api
 */
declare var window: Window;

/**
* A service for working with local storage. Supports getting, setting, and removing values.
*/
@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    /**
     * Get an item in local storage.
     * 
     * @param {string} name the name of the item to get
     * @returns {string | null} the value of the item in local storage (null if the key does not exist)
     */
    public get(name: string): string | null {
        return window.localStorage.getItem(name);
    }

    /**
     * Get all items in local storage.
     * 
     * @returns {{ name: string, value: string | null }[]} Key value pairs for all local storage items.
     */
    public getAll(): { name: string, value: string | null }[] {
        const result: { name: string; value: string | null; }[] = [];
        const keys = Object.keys(window.localStorage);
        keys.forEach((key: string) => {
            result.push({ "name": key, "value": window.localStorage.getItem(key) });
        });
        return result;
    }

    /**
     * Create/update an item in local storage.
     * 
     * @param {string} name the name of the item to set
     * @param {any} value the value to set
     */
    public set(name: string, value: any): void {
        window.localStorage.setItem(name, value);
    }

    /**
     * Delete an item from local storage.
     * 
     * @param {string} name the name of the item to delete from local storage
     */
    public delete(name: string): void {
        window.localStorage.removeItem(name);
    }

    /**
     * Clears local storage.
     */
    public deleteAll(): void {
        window.localStorage.clear();
    }
}