import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent {
  
  drop() {
    console.log("wjat");
  }
  dragStart(container: string) {
    console.log(container);
  }
  lessonid: string | any;
  constructor(private route : ActivatedRoute) {
    this.lessonid = this.route.snapshot.paramMap.get('id');
  }
  title = this.route.snapshot.paramMap.get('id');
}
