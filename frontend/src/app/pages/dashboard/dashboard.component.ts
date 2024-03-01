import { Component } from '@angular/core';
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
import { UserService } from '../../core/services/user/user.service';
import { CarouselModule } from 'primeng/carousel';
import {Course} from "../../core/models/course.interface";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CheckboxModule, CarouselModule, ButtonModule, ConfirmDialogModule, RouterLink, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  title = 'Dashboard'
  allCourses: Course[] = [];
  userCourses: Course[] = [];
  responsiveOptions: any[] | undefined;
  constructor(private courseService: CourseService, private userService: UserService, private confirmationService: ConfirmationService, private messageService: MessageService) {
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
      this.allCourses = [];
      data.forEach((element: Course) => {
        this.allCourses = [...this.allCourses, element];
      });
    });
    this.userService.getUserCourses().subscribe((data) => {
      this.userCourses = [];
      data.forEach((element: Course) => {
        this.userCourses = [...this.userCourses, element];
      });
    });
  }
  addCourse(courseid: string) {
    this.userService.addCourse(courseid).subscribe((data) => {
      window.location.reload();
    });
  }
  confirm(courseid: string) {
      this.confirmationService.confirm({
        message: 'Are you sure that you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon:"none",
            rejectIcon:"none",
            rejectButtonStyleClass:"p-button-text",
            accept: () => {
                this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
                this.userService.removeCourse(courseid).subscribe((data) => {
                  window.location.reload();
                })
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
            }
      });
  }
  
}
