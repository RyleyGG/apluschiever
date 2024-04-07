import { Component, ViewChildren, QueryList, HostListener, ChangeDetectorRef, Injector, ViewChild, OnInit, ElementRef, ComponentRef, AfterViewInit, ViewContainerRef, ComponentFactoryResolver} from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, DragDropModule, ConfirmDialogModule, CardModule, ThirdpartyComponent, SplitterModule, ButtonModule, VideoComponent, FileviewerComponent, FullscreenComponent],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent implements AfterViewInit {
  @ViewChild('component', { read: ViewContainerRef }) component: ViewContainerRef | any;
  @ViewChildren('elements') elements: QueryList<ElementRef> | any;
  fileComp = FileviewerComponent;
  videoComp = VideoComponent;
  thirdComp = ThirdpartyComponent;
  componentRefs: any[] = [];
  focusComponent: any;
  fullScreen: any;
  maximize(componentType: any, input: string) {
    this.fullScreen = {
      componentType: componentType,
      input: input,
      size: '100'
    }
  }
  lessonComponentArray: { componentType: any, input: any , size: any, minimize: any}[] = [
    { componentType: FileviewerComponent, input: null, size: '100', minimize: false},
    { componentType: ThirdpartyComponent, input: 'https://www.mathsisfun.com/pythagoras.html' , size: '100', minimize: false},
    { componentType: ThirdpartyComponent, input: 'https://www.calculator.net/pythagorean-theorem-calculator.html' , size: '100', minimize: false},
    { componentType: VideoComponent, input: 'https://www.youtube.com/embed/vbG_YBTiN38?si=vnI_tJ4xFaqiMnlz' , size: '100', minimize: false},
    { componentType: ThirdpartyComponent, input: 'https://www.mathplanet.com/education/pre-algebra/right-triangles-and-algebra/the-pythagorean-theorem' , size: '100', minimize: false},
    { componentType: VideoComponent, input: 'https://www.youtube.com/embed/uthjpYKD7Ng?si=CrgWvB8aSgHVGJmr' , size: '100', minimize: false},
  ];

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    this.checkHeight();
  }
  checkHeight() {
    this.elements.forEach((elementRef: ElementRef) => {
      const div = elementRef.nativeElement;
      const divHeight = div.offsetHeight;
      console.log('Div height:', divHeight);
    });
  }
  ngAfterViewInit(): void {
    if (this.lessonComponentArray.length > 0) {
      this.focusComponent= {
        componentType: this.lessonComponentArray[0].componentType,
        input: this.lessonComponentArray[0].input,
        size: this.lessonComponentArray[0].size
      }
    }
  }
  title = "";
  node_id: string | any; 
  lesson: any;
  desc: any;
  indexTarget: any;
  indexSource: any;
  drop(index: any) {
    this.indexTarget = index;
    const temp = this.lessonComponentArray[this.indexSource];
    this.lessonComponentArray[this.indexSource] = this.lessonComponentArray[this.indexTarget];
    this.lessonComponentArray[this.indexTarget] = temp;
    console.log(this.lessonComponentArray);
    this.cdr.detectChanges();
  }
  focus() {
    this.focusComponent = {
      componentType: this.lessonComponentArray[this.indexSource].componentType,
      input: this.lessonComponentArray[this.indexSource].input,
      size: this.lessonComponentArray[this.indexSource].size
    }
  }
  showObjectives = false;
  dragStart(index: any) {
    this.indexSource = index;
  }
  constructor(private cdr: ChangeDetectorRef, private injector: Injector, private resolver: ComponentFactoryResolver, private nodeService: NodeService, private route : ActivatedRoute, private sanitizer: DomSanitizer) {
    this.node_id = this.route.snapshot.paramMap.get('id');
    this.nodeService.getNode(this.node_id).subscribe((data: any) => {
      this.title = data.title;
      this.lesson = data;
      this.desc = data.short_descriptioon
    });
  }
}
