import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { FullscreenComponent } from '../fullscreen/fullscreen.component';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { DragdropDirective } from '../../core/directives/dragdrop.directive';
import { LessonComponent } from '../../pages/lesson/lesson.component';


@Component({
  selector: 'app-video',
  standalone: true,
  imports: [ButtonModule, FullscreenComponent, DragdropDirective, CommonModule, DragDropModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent {
  //accepts youtube
  @Input() param: string | any;
  constructor(private sanitizer: DomSanitizer) {}
  getURL(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.param);
  }
}
