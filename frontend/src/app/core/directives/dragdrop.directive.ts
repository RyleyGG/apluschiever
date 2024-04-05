import { Directive, HostListener, ElementRef } from '@angular/core';
import { DragDropModule } from 'primeng/dragdrop';

@Directive({
  selector: '[appDragdrop]',
  standalone: true
})
export class DragdropDirective {

  constructor(private element: ElementRef, private dragDropService: DragDropModule) {}

  @HostListener('dragstart', ['$event'])
  onDragStart(event: any) {
  }

  @HostListener('drop', ['$event'])
  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const source = event.sourceElement;
    const target = event.target;
    //const temp = source;
    //source.innerHTML = target.innerHTML;
    //target.innerHTML = temp.innerHTML;
    console.log("source" + source);
    console.log("html" + source.innerHTML);
  }
}
