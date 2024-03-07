import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import { ButtonModule } from 'primeng/button';
import { Location } from '@angular/common';

@Component({
  selector: 'app-lesson',
  standalone: true,
  imports: [CommonModule, DragDropModule, ButtonModule],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.css'
})
export class LessonComponent {
  
  drop() {
    
  }
  dragStart(container: string) {
    console.log(container);
  }
  constructor(private route : ActivatedRoute, private location: Location) {
  }
  title = this.route.snapshot.paramMap.get('id');
  return(): void {
    this.location.back();
  }
}
