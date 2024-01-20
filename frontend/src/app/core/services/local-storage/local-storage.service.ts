import { Injectable } from "@angular/core";

declare var window: Window;

/**
* A service for working with local storage. Supports getting, setting, and removing values.
*/
@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    constructor() { }

    /**
     * Get an item in local storage.
     * 
     * @param {string} name the name of the item to get
     * @returns {any} the value of the item in local storage (null if the key does not exist)
     */
    public get(name: string): any {
        return window.localStorage.getItem(name);
    }

    //TODO: Create a getAll method

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