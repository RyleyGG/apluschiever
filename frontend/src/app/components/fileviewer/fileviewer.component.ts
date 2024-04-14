import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { FullscreenComponent } from '../fullscreen/fullscreen.component';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { DragdropDirective } from '../../core/directives/dragdrop.directive';
import { LessonComponent } from '../../pages/lesson/lesson.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-fileviewer',
  standalone: true,
  imports: [ButtonModule, FullscreenComponent, DragdropDirective, CommonModule, DragDropModule],
  templateUrl: './fileviewer.component.html',
  styleUrl: './fileviewer.component.css'
})
export class FileviewerComponent {
  @Input() public param: string[] | any;
  content: string | any;
  contentType: string | any;
  safeURL: any;
  constructor(private sanitizer: DomSanitizer) {

  } 
  getURL(): SafeResourceUrl  {
    this.content = this.param[0];
    this.contentType = this.param[1];
    this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl('data:' + this.contentType + ';base64,' + this.content);
    return this.safeURL;
  }
}
