import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '../../core/models/user.interface';
import { uid } from '../../core/utils/unique-id';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


/**
 * Component for the user dashboard page
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CheckboxModule, ProgressSpinnerModule, CarouselModule, FormsModule, DialogModule, InputTextModule, ProgressBarModule, DataViewModule, SidebarModule, ButtonModule, ConfirmDialogModule, RouterLink, CardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  public loaded: boolean = false;
  /**
   * A listing of all available courses
   */
  public allCourses: Course[] = [];
  /**
   * A listing of all courses available for enrollment
   */
  public toEnroll: Course[] = [];
  /**
   * The courses displayed to the user in the dashboard. This may be filtered with button clicks. 
   */
  public displayedCourses: any[] = [];


  /**
   * Listing of the courses the user is enrolled in
   */
  public userCourses: any[] = [];
  /**
   * Listing of the courses the user is enrolled in and has completed
   */
  public userCompletedCourses: any[] = [];
  /**
   * Listing of the courses the user is enrolled in and hasn't completed
   */
  public userInProgressCourses: any[] = [];
  /**
   * Listing of the courses the user is a teacher for
   */
  public teachingCourses: any[] = [];

  /**
   * Whether the enrollment sidebar should be shown or not
   */
  public sidebarVisible: boolean = false;
  /**
   * A variable storing the logged in user data
   */
  public loggedInUser: User | null = null;

  /**
   * Whether the edit profile dialog should be shown or not
   */
  public editProfileDialogVisible: boolean = false;
  public searchValue: string = "";
  public updatedFirstName: string = "";
  public updatedLastName: string = "";
  public updatedEmail: string = "";
  public searchedCourses: any[] = [];
  ownedByMe: boolean = false;
  all: boolean = true;
  completed: boolean = false;
  inProgress: boolean = false;
  constructor(private courseService: CourseService, private userService: UserService, private confirmationService: ConfirmationService, private messageService: MessageService) {
    // Get the courses the user is enrolled in...
    this.userService.getUserCourses().subscribe((data) => {
      this.userCourses = [];
      data.forEach((element: Course) => {
        this.userCourses = [...this.userCourses, element];
      });
    });
    this.courseService.getCourses({ is_published: true }).subscribe((data) => {
      this.allCourses = [];
      data.forEach((element: Course) => {
          this.allCourses = [...this.allCourses, element];
        });
    });
    // Get the course progresses
    this.userService.getUserCoursesProgress(this.userCourses.map(item => item.id)).subscribe((data) => {
      for (let key in data) {
        (this.userCourses.find(course => course.id == key) as any).progress = data[key];
      }
    });
      // Create the secondary arrays
      this.userCompletedCourses = this.userCourses.filter((course) => course.progress! === 100);
      this.userInProgressCourses = this.userCourses.filter((course) => course.progress! !== 100);

      this.displayedCourses = this.userCourses;
      this.searchedCourses = this.userCourses;
    

    // Get user information and the coureses the user owns...
    this.userService.getCurrentUser().subscribe((data) => {
      this.loggedInUser = data;
      this.updatedFirstName = this.loggedInUser?.first_name || "";
      this.updatedLastName = this.loggedInUser?.last_name || "";
      this.updatedEmail = this.loggedInUser?.email_address || "";
      this.courseService.getCourses({ owned_by: [this.loggedInUser!.id] }).subscribe((teacherData) => {
        this.teachingCourses = [];
        teacherData.forEach((element: Course) => {
          this.teachingCourses = [...this.teachingCourses, element];
        });
        console.log("im teaching here");
        console.log(this.teachingCourses);
      });
    });
    setTimeout(() => {
      this.allCourses.forEach((element: Course) => {
        if (!this.teachingCourses.some(course => course.id === element.id) && !this.userCourses.some(course => course.id === element.id)) {
          this.toEnroll = [...this.toEnroll, element];
        }
      })
      this.loaded = true;
      this.displayAll();
    }, 500);

  }
  addCourse(courseid: string) {
    this.userService.addCourse(courseid).subscribe((data) => {
      console.log("added");
      window.location.reload();
    });
  }
  search(value: string) {
    this.searchedCourses = this.displayedCourses.filter(course =>
      course.title.toLowerCase().includes(value.toLowerCase())
    );
  }
  displayAll() {
    this.displayedCourses = this.userCourses;
    this.search(this.searchValue);
    this.all = true;
    this.inProgress = false;
    this.completed = false;
    this.ownedByMe = false;
  }
  displayInProgress() {
    this.displayedCourses = this.userInProgressCourses;
    this.search(this.searchValue);
    this.all = false;
    this.inProgress = true;
    this.completed = false;
    this.ownedByMe = false;
  }
  displayComplete() {
    this.displayedCourses = this.userCompletedCourses;
    this.search(this.searchValue);
    this.all = false;
    this.inProgress = false;
    this.completed = true;
    this.ownedByMe = false;
  }
  displayOwned() {
    this.displayedCourses = this.teachingCourses;
    this.search(this.searchValue);
    this.all = false;
    this.inProgress = false;
    this.completed = false;
    this.ownedByMe = true;
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

  /**
   * Used to prevent a duplicate scrollbar from appearing in the register for classes panel.
   *
   * @param event true if open sidebar, false if closed
   */
  onSidebarVisibilityChange(event: any) {
    if (event) {
      document.documentElement.classList.add('side-panel-open');
    } else {
      document.documentElement.classList.remove('side-panel-open');
    }
  }

  //#region Updating User Info

  public cancelUserUpdate() {
    this.updatedFirstName = this.loggedInUser?.first_name || "";
    this.updatedLastName = this.loggedInUser?.last_name || "";
    this.updatedEmail = this.loggedInUser?.email_address || "";
  }

  public updateUserInformation() {
    console.log("UPDATE!");
    console.log(this.updatedFirstName);
    console.log(this.updatedLastName);
    console.log(this.updatedEmail);
    this.userService.updateCurrentUser({
      id: this.loggedInUser?.id || uid(),
      first_name: this.updatedFirstName,
      last_name: this.updatedLastName,
      email_address: this.updatedEmail,
      user_type: this.loggedInUser?.user_type || 'Student'
    }).subscribe((data) => {
      console.log(data);
      window.location.reload();
    });
  }

  //#endregion Updating User Info

}
