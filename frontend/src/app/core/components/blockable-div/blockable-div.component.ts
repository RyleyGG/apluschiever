import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import { BlockableUI } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';


/**
 * A blockable div which can be used to wrap elements which you wish to block with PrimeNG that don't have the BlockableUI interface enabled.
 * 
 * Credit to: https://github.com/primefaces/primeng/issues/2003
 */
@Component({
    selector: 'blockable-div',
    standalone: true,
    template: `        
        <div [ngStyle]="style" [ngClass]="class" ><ng-content></ng-content></div>
    `,
    imports: [CommonModule, BlockUIModule]
})
export class BlockableDiv implements BlockableUI {
    @Input() style: any;
    @Input() class: any;

    constructor(private el: ElementRef) { }

    getBlockableElement = (): HTMLElement => this.el.nativeElement.children[0];
}
