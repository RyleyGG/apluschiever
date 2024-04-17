import { Component, ViewChildren, QueryList, HostListener, ChangeDetectorRef, Injector, ViewChild, OnInit, ElementRef, ComponentRef, AfterViewInit, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
import { Location } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ErrorComponent } from '../../components/error/error.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ErrorComponent, DragDropModule, ProgressSpinnerModule, RouterLink, QuizComponent, ConfirmDialogModule, CardModule, ThirdpartyComponent, SplitterModule, ButtonModule, VideoComponent, FileviewerComponent, FullscreenComponent],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent implements AfterViewInit {
  fileComp = FileviewerComponent;
  videoComp = VideoComponent;
  thirdComp = ThirdpartyComponent;
  quizComp = QuizComponent;
  loaded = false;
  ngOnInit() {
    setTimeout(() => {
      this.loaded = true;

    }, 2000);
  }
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
  lessonComponentArray: { title: any, componentType: any, input: any, minimize: boolean }[] = [];

  ngAfterViewInit(): void {

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

  courseId: string | any;
  link(url: any) {
    window.open(url, '_blank');
  }

  showObjectives = false;
  dragStart(index: any) {
    this.indexSource = index;
  }

  goBack(): void {
    this.location.back();
  }

  constructor(private location: Location, private cdr: ChangeDetectorRef, private nodeService: NodeService, private route: ActivatedRoute) {
    this.node_id = this.route.snapshot.paramMap.get('id');
    this.nodeService.getNode(this.node_id).subscribe((data: any) => {
      this.title = data.title;
      this.lesson = data;
      this.desc = data.rich_text_files[0].content;
      this.courseId = data.course_id;
      console.log(this.node_id);

      data.third_party_resources.forEach((thirdparty: any) => {
        this.lessonComponentArray.push({
          title: "Website",
          componentType: this.thirdComp,
          input: thirdparty.embed_link,
          minimize: false
        });
      })
      data.uploaded_files.forEach((file: any) => {
        this.lessonComponentArray.push({
          title: file.name.substring(0, file.name.lastIndexOf('.')),

          componentType: this.fileComp,
          input: [file.content, file.type],
          minimize: false
        });
      });
      if (data.assessment_file) {
        this.lessonComponentArray.push({
          title: "Assessment",
          componentType: this.quizComp,
          input: data.assessment_file.questions,
          minimize: false
        });
      }

      if (this.lessonComponentArray.length > 0) {
        this.focusComponent = {
          title: this.lessonComponentArray[0].title,
          componentType: this.lessonComponentArray[0].componentType,
          input: this.lessonComponentArray[0].input
        }
      }

    });

    if (this.lessonComponentArray.length == 0) {
      console.log("empty");
    }
    console.log(this.lessonComponentArray);
  }
}
