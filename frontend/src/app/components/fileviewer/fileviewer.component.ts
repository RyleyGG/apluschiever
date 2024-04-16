import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { FullscreenComponent } from '../fullscreen/fullscreen.component';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { DragdropDirective } from '../../core/directives/dragdrop.directive';
import { LessonComponent } from '../../pages/lesson/lesson.component';
import { HttpClient } from '@angular/common/http';
import { ErrorComponent } from '../error/error.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-fileviewer',
  standalone: true,
  imports: [ButtonModule, ErrorComponent, ProgressSpinnerModule, FullscreenComponent, DragdropDirective, CommonModule, DragDropModule],
  templateUrl: './fileviewer.component.html',
  styleUrl: './fileviewer.component.css'
})
export class FileviewerComponent implements OnInit{
  ngOnInit() {
    setTimeout(() => {
      this.loaded = true;
      
    }, 6000); 
  }
  @Input() public param: any[] | any;
  content: string | any;
  contentType: string | any;
  safeURL: any;
  constructor(private sanitizer: DomSanitizer) {
  } 
  displayError(): boolean {
    if (Array.isArray(this.param) && this.param.length === 2) {
      return false;
    }
    else {
      return true;
    }
  }
  loaded = false;
  getURL(): SafeResourceUrl  {
    this.content = this.param[0];
    this.contentType = this.param[1];
    this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl('data:' + this.contentType + ';base64,' + this.content);
    return this.safeURL;
  }
}
