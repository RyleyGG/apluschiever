import { Component, OnInit } from '@angular/core';
import { OAuth2Service } from '../../auth/oauth2.service';
import { SuccessfulUserAuth } from '../../core/models/auth.interface';
import { CheckboxModule } from 'primeng/checkbox';
import { FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms'; 
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CourseService } from '../../core/services/course/course.service';
import { CarouselModule } from 'primeng/carousel';
import {Course} from "../../core/models/course.interface";
import { toArray } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CheckboxModule, CarouselModule, ButtonModule, RouterLink, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  title = 'Dashboard'
  courses: Course[] = [];
  responsiveOptions: any[] | undefined;
  constructor(private courseService: CourseService) {
    this.responsiveOptions = [
      {
          breakpoint: '1199px',
          numVisible: 1,
          numScroll: 1
      },
      {
          breakpoint: '991px',
          numVisible: 2,
          numScroll: 1
      },
      {
          breakpoint: '767px',
          numVisible: 1,
          numScroll: 1
      }
  ];
    this.courseService.getCourses().subscribe((data) => {
      this.courses = [];
      data.forEach((element: Course) => {
        this.courses = [...this.courses, element];
      });
    }
    );
  }
  
  
}
