import { Component } from '@angular/core';
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
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, DragDropModule, SplitterModule, ButtonModule, VideoComponent, FileviewerComponent, FullscreenComponent],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent {
  title = "";
  node_id: string | any; 
  lesson: any;
  box1 = [FileviewerComponent];
  box2 = [VideoComponent];
  box3 = [null];
  box4 = [FileviewerComponent];
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
  constructor(private nodeService: NodeService, private route : ActivatedRoute) {
    this.node_id = this.route.snapshot.paramMap.get('id');
    this.nodeService.getNode(this.node_id).subscribe((data: any) => {
      this.title = data.title;
      this.lesson = data;
    });
  }
//getNode(node_id: string) 
  

}
