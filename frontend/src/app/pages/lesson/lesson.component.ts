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
import { NodeProgressDetails } from "../../core/models/node-content.interface";
import { take } from "rxjs/operators";

/**
 * The webpage which displays the lesson. 
 */
@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ErrorComponent, DragDropModule, ProgressSpinnerModule, RouterLink, QuizComponent, ConfirmDialogModule, CardModule, ThirdpartyComponent, SplitterModule, ButtonModule, VideoComponent, FileviewerComponent, FullscreenComponent],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent {
  // These are needed so we can access component types in HTML template
  public fileComp = FileviewerComponent;
  public videoComp = VideoComponent;
  public thirdComp = ThirdpartyComponent;
  public quizComp = QuizComponent;

  /**
   * Whether the page has finished loading. 
   */
  public loaded = false;

  /**
   * The title of the lesson page (typically the name of the lesson).
   */
  public title = "";

  /**
   * The component that is being focused within the side panel.
   */
  public focusComponent: { title: any; componentType: any; input: any; } | null = null;

  /**
   * The component that is being shown in fullscreen mode. 
   */
  public fullScreen: { title: any; componentType: any; input: any; } | null = null;

  /**
   * The listing of components within an array, that are being displayed on the page. 
   */
  public lessonComponentArray: { title: any, componentType: any, input: any, minimize: boolean }[] = [];

  /**
   * The id of the lesson (called node id to be consistent with graph terminology).
   */
  public node_id: string;

  /**
   * The description of the lesson (aka the rich text contents).
   */
  public desc: any;

  /**
   * The id of the course this node belongs to (used to link backwards).
   */
  public courseId: string | any;

  private lesson: any;
  private indexTarget: any;
  private indexSource: any;

  /**
   * Whether lesson objectives should be shown or not. 
   */
  public showObjectives = false;

  /**
   * Sets up the lessonComponentArray, and if necessary updates the node progress. 
   * @param cdr 
   * @param nodeService 
   * @param route 
   */
  constructor(private cdr: ChangeDetectorRef, private nodeService: NodeService, private route: ActivatedRoute) {
    // We know the node id exists due to how routing is setup
    this.node_id = this.route.snapshot.paramMap.get('id')!;

    this.nodeService.getNode(this.node_id).subscribe((data: any) => {
      // Get general data from response
      this.lesson = data;
      this.title = data.title;
      this.desc = data.rich_text_files[0].content;
      this.courseId = data.course_id;

      // Add all the third party resources
      if (data.third_party_resources) {
        data.third_party_resources.forEach((thirdparty: any) => {
          this.lessonComponentArray.push({
            title: "Website",
            componentType: this.thirdComp,
            input: thirdparty.embed_link,
            minimize: false
          });
        });
      }

      // Add all the uploaded files
      if (data.uploaded_files) {
        data.uploaded_files.forEach((file: any) => {
          this.lessonComponentArray.push({
            title: file.name.substring(0, file.name.lastIndexOf('.')),
            componentType: this.fileComp,
            input: [file.content, file.type],
            minimize: false
          });
        });
      }

      // Add and focus the assessment if one exists...
      if (data.assessment_file) {
        this.lessonComponentArray.push({
          title: "Assessment",
          componentType: this.quizComp,
          input: data.assessment_file.questions,
          minimize: false
        });
        this.focus(this.lessonComponentArray.length - 1);
      } else {
        // Otherwise focus the first received thing and update node progress. 
        if (this.lessonComponentArray.length > 0) { this.focus(0); }
        this.updateNodeProgress();
      }

      // The page has loaded.
      this.loaded = true;
    });
  }

  /**
   * Use a 2 second delay before claiming that there is no content to be found. 
   */
  ngOnInit = (): void => { setTimeout(() => { this.loaded = true; }, 2000); }

  /**
   * Used to link to an external resource
   * @param {string} url the url of the external resource.
   */
  link = (url: string): void => { window.open(url, '_blank'); }

  /**
   * Called when a node dragging is begun.
   * @param {number} index the index of the component being dragged. 
   */
  dragStart = (index: number): void => { this.indexSource = index; }

  /**
   * Drop a component. 
   * 
   * @param {number} index the index of the component that is being dropped onto
   */
  drop = (index: number) => {
    this.indexTarget = index;
    const temp = this.lessonComponentArray[this.indexSource];
    this.lessonComponentArray[this.indexSource] = this.lessonComponentArray[this.indexTarget];
    this.lessonComponentArray[this.indexTarget] = temp;
    this.cdr.detectChanges();
  }

  /**
   * Bring a specific component into focus (makes it big in the side panel).
   */
  focus = (index: number = this.indexSource): void => {
    this.focusComponent = {
      title: this.lessonComponentArray[index].title,
      componentType: this.lessonComponentArray[index].componentType,
      input: this.lessonComponentArray[index].input
    };
  }

  /**
   * Maximize a component in the lesson view. 
   * 
   * @param {any} componentType the type of component that is being maximized
   * @param {string} input the 
   * @param {string} title the title of the component
   */
  maximize = (componentType: any, input: string, title: string): void => {
    this.fullScreen = {
      title: title,
      componentType: componentType,
      input: input,
    };
  }

  /**
   * Update the node progress to be complete. 
   */
  updateNodeProgress = (): void => {
    const nodeProgress: NodeProgressDetails = {
      node_id: this.node_id!,
      node_complete: true
    };

    this.nodeService.updateNodeProgress(nodeProgress).pipe(take(1)).subscribe((res) => {
      if (!!res) {
        console.log('progress updated');
      }
    });
  }
}
