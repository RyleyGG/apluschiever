import { Directive, Output, HostListener, EventEmitter } from '@angular/core';


/**
 * A directive to add more options to the mouse wheel events.
 * 
 * https://github.com/SodhanaLibrary/angular2-examples/blob/master/app/mouseWheelDirective/mousewheel.directive.ts
 */
@Directive({ selector: '[mouseWheel]', standalone: true })
export class MouseWheelDirective {
    /**
     * Emits events when the mouse wheel is scrolled up.
     */
    @Output() mouseWheelUp = new EventEmitter();

    /**
     * Emits events wheen the mouse wheel is scrolled down.
     */
    @Output() mouseWheelDown = new EventEmitter();

    /**
     * Listens for mousewheel on Chrome
     * @param event 
     */
    @HostListener('mousewheel', ['$event'])
    onMouseWheelChrome(event: any) {
        this.mouseWheelFunc(event);
    }

    /**
     * Listens for mousewheel on Firefox
     * @param event 
     */
    @HostListener('DOMMouseScroll', ['$event'])
    onMouseWheelFirefox(event: any) {
        this.mouseWheelFunc(event);
    }

    /**
     * Listens for mousewheel on IE
     * @param event 
     */
    @HostListener('onmousewheel', ['$event'])
    onMouseWheelIE(event: any) {
        this.mouseWheelFunc(event);
    }

    /**
     * Convert all mousewheel events above to a standard form to be emitted.
     * 
     * @param { any } event the event that was fired
     */
    mouseWheelFunc(event: any) {
        var event = window.event || event; // old IE support
        var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

        if (delta > 0) {
            this.mouseWheelUp.emit(event);
        } else if (delta < 0) {
            this.mouseWheelDown.emit(event);
        }

        // for IE
        event.returnValue = false;

        // for Chrome and Firefox
        if (event.preventDefault) {
            event.preventDefault();
        }
    }

}