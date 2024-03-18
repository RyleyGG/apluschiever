import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { VideoComponent } from '../../components/video/video.component';
import { FileviewerComponent } from '../../components/fileviewer/fileviewer.component';
import {Markdown, Video} from "../../core/models/node-content.interface";
import { Node } from "../../graph/graph.interface";
import { NodeService } from '../../core/services/node/node.service';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, DragDropModule, VideoComponent, FileviewerComponent],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent {
  title = "";
  node_id: string | any; 
  lesson: any;
  box1 = [FileviewerComponent];
  box2 = [VideoComponent];
  box3 = [];
  box4 = [];
  //source: string[] = [];
  //target: string[] = [];
  //temporary: string[] = [];
  drop(box: string[]) {
    //this.temporary.splice(0, this.temporary.length, ...box);
    //box.splice(0, box.length, ...this.source);
    //this.source.splice(0, this.source.length, ...this.temporary);
  }
  dragStart(container: string[]) {
    //this.source = container;
    //console.log(container);
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
