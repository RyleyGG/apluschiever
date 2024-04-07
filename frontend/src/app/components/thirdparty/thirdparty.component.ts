import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { FullscreenComponent } from '../fullscreen/fullscreen.component';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import {Markdown, Video} from "../../core/models/node-content.interface";
import { Node } from "../../graph/graph.interface";
import { NodeService } from '../../core/services/node/node.service';
import { DragdropDirective } from '../../core/directives/dragdrop.directive';
import { LessonComponent } from '../../pages/lesson/lesson.component';


@Component({
  selector: 'app-thirdparty',
  standalone: true,
  imports: [ButtonModule, FullscreenComponent, DragdropDirective, CommonModule, DragDropModule],
  templateUrl: './thirdparty.component.html',
  styleUrl: './thirdparty.component.css'
})
export class ThirdpartyComponent {
  @Input() param: string | any;
  minimize = false;
  fullScreen = false;
  constructor(private sanitizer: DomSanitizer, private LessonComponent: LessonComponent) {}
  getURL(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.param);
  }
  value = false;
  makefull() {
    this.fullScreen = true;
    this.LessonComponent.maximize(ThirdpartyComponent, this.param);
  }
}
