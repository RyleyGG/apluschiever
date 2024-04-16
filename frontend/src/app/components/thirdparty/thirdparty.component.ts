import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { FullscreenComponent } from '../fullscreen/fullscreen.component';
import { FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { DragdropDirective } from '../../core/directives/dragdrop.directive';

@Component({
  selector: 'app-thirdparty',
  standalone: true,
  imports: [ButtonModule, FullscreenComponent, DragdropDirective, CommonModule, DragDropModule],
  templateUrl: './thirdparty.component.html',
  styleUrl: './thirdparty.component.css'
})
export class ThirdpartyComponent  {
  @Input() public param: string | any;
  safeURL: any;
  constructor(private sanitizer: DomSanitizer) {} 
  getURL(): SafeUrl  {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.param);
  }


}
