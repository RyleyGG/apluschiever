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
  box1 = ['item1'];
  box2 = ['item2', 'another2'];
  box3 = ['item3', 'another3'];
  box4 = ['item4'];
  source: string[] = [];
  target: string[] = [];
  temporary: string[] = [];
  drop(box: string[]) {
    this.temporary.splice(0, this.temporary.length, ...box);
    box.splice(0, box.length, ...this.source);
    this.source.splice(0, this.source.length, ...this.temporary);
  }
  dragStart(container: string[]) {
    this.source = container;
    console.log(container);
  }
  constructor(private route : ActivatedRoute) {
  }
  title = this.route.snapshot.paramMap.get('id');
}
