import { Component, ViewChild, OnInit, ElementRef, ComponentRef, AfterViewInit, QueryList, ViewContainerRef, ComponentFactoryResolver} from '@angular/core';
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
export class LessonComponent implements AfterViewInit {
  @ViewChild('component', { read: ViewContainerRef }) component: ViewContainerRef | any;
  
  componentRefs: any[] = [];

  lessonComponentArray: { componentType: any, input: any }[] = [
    { componentType: FileviewerComponent, input: null},
    { componentType: ThirdpartyComponent, input: 'https://www.mathsisfun.com/pythagoras.html' },
    { componentType: ThirdpartyComponent, input: 'https://www.calculator.net/pythagorean-theorem-calculator.html' },
    { componentType: VideoComponent, input: 'https://www.youtube.com/embed/vbG_YBTiN38?si=vnI_tJ4xFaqiMnlz' },
    { componentType: ThirdpartyComponent, input: 'https://www.mathplanet.com/education/pre-algebra/right-triangles-and-algebra/the-pythagorean-theorem' },
    { componentType: VideoComponent, input: 'https://www.youtube.com/embed/uthjpYKD7Ng?si=CrgWvB8aSgHVGJmr' },
  ];
  ngAfterViewInit(): void {
    this.lessonComponentArray.forEach((componentData) => {
      const factory = this.resolver.resolveComponentFactory(componentData.componentType);
      const componentRef = this.component.createComponent(factory);
      componentRef.instance.param = componentData.input;
      this.componentRefs.push(componentRef);
    });
  }
  title = "";
  node_id: string | any; 
  lesson: any;
  swap() {
    const temp = this.lessonComponentArray[0];
    this.lessonComponentArray[0] = this.lessonComponentArray[2];
    this.lessonComponentArray[2] = temp;
  }
  test(component: any) {
    console.log("click!" + component);
  }
  showObjectives = false;
  seeMore() {
    this.showObjectives = !this.showObjectives;
  }
  drop(component: any) {
    console.log("hum" + component);
  }
  dragStart(component: any) {
    console.log("yum" + component);
  }
  constructor(private resolver: ComponentFactoryResolver, private nodeService: NodeService, private route : ActivatedRoute, private sanitizer: DomSanitizer) {
    this.node_id = this.route.snapshot.paramMap.get('id');
    this.nodeService.getNode(this.node_id).subscribe((data: any) => {
      this.title = data.title;
      this.lesson = data;
    });
  }
}
