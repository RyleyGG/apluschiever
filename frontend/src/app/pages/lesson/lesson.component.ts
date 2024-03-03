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
    
  }
  dragStart(container: string) {
    console.log(container);
  }
  constructor(private route : ActivatedRoute) {
  }
  title = this.route.snapshot.paramMap.get('id');
}
