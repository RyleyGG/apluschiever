import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { FullscreenComponent } from '../fullscreen/fullscreen.component';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { FileviewerComponent } from '../../components/fileviewer/fileviewer.component';
import {Markdown, Video} from "../../core/models/node-content.interface";
import { Node } from "../../graph/graph.interface";
import { NodeService } from '../../core/services/node/node.service';
import { ThirdpartyComponent } from '../../components/thirdparty/thirdparty.component';
import { SplitterModule } from 'primeng/splitter';
import { DragdropDirective } from '../../core/directives/dragdrop.directive';


@Component({
  selector: 'app-video',
  standalone: true,
  imports: [ButtonModule, FullscreenComponent, DragdropDirective, CommonModule, DragDropModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent {
  @Input() param: string | any;
  minimize = false;
  constructor(private sanitizer: DomSanitizer) {}
  getURL(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.param);
  }
  value = false;
  makefull(value: boolean) {
    this.value = value;
  }
  onDragStart(event: any) {
    console.log('Dragging started');
  }
}
