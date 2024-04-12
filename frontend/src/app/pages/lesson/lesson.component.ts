import { Component, ViewChildren, QueryList, HostListener, ChangeDetectorRef, Injector, ViewChild, OnInit, ElementRef, ComponentRef, AfterViewInit, ViewContainerRef, ComponentFactoryResolver} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { ButtonModule } from 'primeng/button';
import { VideoComponent } from '../../components/video/video.component';
import { FileviewerComponent } from '../../components/fileviewer/fileviewer.component';
import { NodeService } from '../../core/services/node/node.service';
import { FullscreenComponent } from '../../components/fullscreen/fullscreen.component';
import { QuizComponent } from '../../components/quiz/quiz.component';
import { ThirdpartyComponent } from '../../components/thirdparty/thirdparty.component';
import { SplitterModule } from 'primeng/splitter';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, DragDropModule, QuizComponent, ConfirmDialogModule, CardModule, ThirdpartyComponent, SplitterModule, ButtonModule, VideoComponent, FileviewerComponent, FullscreenComponent],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent implements AfterViewInit {
  fileComp = FileviewerComponent;
  videoComp = VideoComponent;
  thirdComp = ThirdpartyComponent;
  quizComp = QuizComponent;
  componentRefs: any[] = [];
  focusComponent: any;
  fullScreen: any;
  maximize(componentType: any, input: string, title: string) {
    this.fullScreen = {
      title: title,
      componentType: componentType,
      input: input,
    }
  }
  lessonComponentArray: { title: any, componentType: any, input: any , minimize: boolean}[] = [
    { title: "Lesson Assessment", componentType: QuizComponent, input: null, minimize: false},
    { title: "File", componentType: FileviewerComponent, input: null, minimize: false},
    { title: "Third party", componentType: ThirdpartyComponent, input: 'https://www.mathsisfun.com/pythagoras.html' , minimize: false},
    { title: "Third party", componentType: ThirdpartyComponent, input: 'https://www.calculator.net/pythagorean-theorem-calculator.html' , minimize: false},
    { title: "Video", componentType: ThirdpartyComponent, input: 'https://www.youtube.com/embed/vbG_YBTiN38?si=vnI_tJ4xFaqiMnlz' , minimize: false},
    { title: "Third party", componentType: ThirdpartyComponent, input: 'https://www.mathplanet.com/education/pre-algebra/right-triangles-and-algebra/the-pythagorean-theorem' , minimize: false},
    { title: "Video", componentType: ThirdpartyComponent, input: 'https://www.youtube.com/embed/uthjpYKD7Ng?si=CrgWvB8aSgHVGJmr' , minimize: false},
  ];

  ngAfterViewInit(): void {
    if (this.lessonComponentArray.length > 0) {
      this.focusComponent= {
        title: this.lessonComponentArray[0].title,
        componentType: this.lessonComponentArray[0].componentType,
        input: this.lessonComponentArray[0].input
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
    this.cdr.detectChanges();
  }
  focus() {
    this.focusComponent = {
      title: this.lessonComponentArray[this.indexSource].title,
      componentType: this.lessonComponentArray[this.indexSource].componentType,
      input: this.lessonComponentArray[this.indexSource].input
    }
  }
  link(url: any) {
    window.open(url, '_blank');
  }
  showObjectives = false;
  dragStart(index: any) {
    this.indexSource = index;
  }
  constructor( private cdr: ChangeDetectorRef, private nodeService: NodeService, private route : ActivatedRoute) {
    this.node_id = this.route.snapshot.paramMap.get('id');
    this.nodeService.getNode(this.node_id).subscribe((data: any) => {
      this.title = data.title;
      this.lesson = data;
      this.desc = data.short_descriptioon
    });
  }
}
