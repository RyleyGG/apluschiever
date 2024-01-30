import { Inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * A service for working with the document theme (light/dark mode and others).
 */
@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    /**
     * Private signal used to store what theme is in use.
     */
    private themeSignal = signal<string>("saga-blue");

    /**
     * Public signal that can be used to track changes to the theme. 
     */
    public readonly theme = this.themeSignal.asReadonly();

    /**
     * Creates the ThemeService.
     * 
     * @param document the document to set the theme for (don't worry about setting this, Angular injects this for us)
     */
    constructor(@Inject(DOCUMENT) private document: Document) { }

    /**
     * Sets a new theme for the application.
     * 
     * @param {string} theme the name of the theme to use (the part before the .css in the filename) 
     */
    setTheme(theme: string): void {
        let themeLink = this.document.getElementById('app-theme') as HTMLLinkElement;

        if (themeLink) {
            themeLink.href = theme + '.css';
            this.themeSignal.set(theme);
        }
    }
}