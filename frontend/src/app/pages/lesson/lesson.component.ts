import { Component, ViewChild, AfterViewInit, ElementRef, ComponentFactoryResolver} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { ButtonModule } from 'primeng/button';
import { VideoComponent } from '../../components/video/video.component';
import { FileviewerComponent } from '../../components/fileviewer/fileviewer.component';
import {Markdown, Video} from "../../core/models/node-content.interface";
import { Node } from "../../graph/graph.interface";
import { NodeService } from '../../core/services/node/node.service';
import { FullscreenComponent } from '../../components/fullscreen/fullscreen.component';
import { ThirdpartyComponent } from '../../components/thirdparty/thirdparty.component';
import { SplitterModule } from 'primeng/splitter';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, DragDropModule, ThirdpartyComponent, SplitterModule, ButtonModule, VideoComponent, FileviewerComponent, FullscreenComponent],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent{
  @ViewChild('video') childDiv!: ElementRef;
  
  title = "";
  node_id: string | any; 
  lesson: any;
  box1= [VideoComponent];
  box2= [FileviewerComponent];
  box3 = [ThirdpartyComponent];
  box4 = [ThirdpartyComponent];
  currentComponent = null;
  componentSource = null;
  componentTarget = null;
  source: any[] = [];
  target: any[] = [];
  showObjectives = false;
  seeMore() {
    this.showObjectives = !this.showObjectives;
  }
  drop(component: any, box: any) {
    this.componentTarget = component;
    this.target = box;
    if (this.target != this.source) {
      this.target.pop();
      this.source.pop();
      this.target.push(this.componentSource);
      this.source.push(this.componentTarget);
    }
  }
  dragStart(component: any, box: any) {
    this.componentSource = component;
    this.source = box;
  }
  fullscreen(component: any) {
    this.currentComponent = component;
  }
  constructor(private resolver: ComponentFactoryResolver, private nodeService: NodeService, private route : ActivatedRoute, private sanitizer: DomSanitizer) {
    this.node_id = this.route.snapshot.paramMap.get('id');
    this.nodeService.getNode(this.node_id).subscribe((data: any) => {
      this.title = data.title;
      this.lesson = data;
    });
  }
}
