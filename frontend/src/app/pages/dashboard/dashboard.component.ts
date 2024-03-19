import { Component } from '@angular/core';
import { OAuth2Service } from '../../auth/oauth2.service';
import { SuccessfulUserAuth } from '../../core/models/auth.interface';
import { CheckboxModule } from 'primeng/checkbox';
import { FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { DataViewModule } from 'primeng/dataview';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CourseService } from '../../core/services/course/course.service';
import { UserService } from '../../core/services/user/user.service';
import { CarouselModule } from 'primeng/carousel';
import { Course } from "../../core/models/course.interface";
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SidebarModule } from 'primeng/sidebar';
import { User } from '../../core/models/user.interface';


/**
 * Component for the user dashboard page
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CheckboxModule, CarouselModule, DataViewModule, SidebarModule, ButtonModule, ConfirmDialogModule, RouterLink, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  /**
   * A listing of all available courses (used for enrollment)
   */
  public allCourses: Course[] = [];

  /**
   * Listing of the courses the user is enrolled in
   */
  public userCourses: Course[] = [];
  /**
   * Listing of the courses the user is enrolled in and has completed
   */
  public userCompletedCourses: Course[] = [];
  /**
   * Listing of the courses the user is enrolled in and hasn't completed
   */
  public userInProgressCourses: Course[] = [];

  /**
   * Whether the enrollment sidebar should be shown or not
   */
  public sidebarVisible: boolean = false;
  /**
   * A variable storing the logged in user data
   */
  public loggedInUser: User | null = null;


  constructor(private courseService: CourseService, private userService: UserService, private confirmationService: ConfirmationService, private messageService: MessageService) {
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
      // add filter here to filter the user courses for complete ones and incomplete ones
    });

    this.userService.getUser().subscribe((data) => {
      this.loggedInUser = data;
    });
  }

  /**
   * Add the currently logged in user to the given course
   * @param courseid course id of the course to add user to
   */
  addCourse(courseid: string) {
    this.userService.addCourse(courseid).subscribe((data) => {
      window.location.reload();
    });
  }

  /**
   * Controls the confirmation pop-up when unenrolling from a course
   * @param courseid the course id to unenroll from.
   */
  confirm(courseid: string) {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to unenroll from this course?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
        this.userService.removeCourse(courseid).subscribe((data) => {
          window.location.reload();
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }
    });
  }

}
