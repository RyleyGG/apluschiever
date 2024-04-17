import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { courseOwnerOnlyGuard, signedInGuard, signedOutGuard, teacherOnlyGuard } from './auth/oauth2.guard';

import { SignInPageComponent } from './pages/signin/signin.page.component';
import { LandingPageComponent } from './pages/landing/landing.page.component';
import { SignUpPageComponent } from './pages/signup/signup.page.component';
import { SignOutPageComponent } from './pages/signout/signout.page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CourseViewPageComponent } from './pages/course-view/course-view.page.component';
import { LessonComponent } from './pages/lesson/lesson.component';
import { CourseBuilderPageComponent } from './pages/course-builder/course-builder.page.component';

export const routes: Routes = [
    // Routes for authentication
    { path: "signup", component: SignUpPageComponent, canActivate: [signedOutGuard] },
    { path: "signin", component: SignInPageComponent, canActivate: [signedOutGuard] },
    { path: "signout", component: SignOutPageComponent, canActivate: [signedInGuard] },

    // Routes for viewing content
    { path: "dashboard", component: DashboardComponent, canActivate: [signedInGuard] },
    { path: "viewer/:id", component: CourseViewPageComponent, canActivate: [signedInGuard] },
    { path: "lesson/:id", component: LessonComponent, canActivate: [signedInGuard] },

    // Routes for creating content
    { path: "builder", component: CourseBuilderPageComponent, canActivate: [teacherOnlyGuard] },
    { path: "builder/:id", component: CourseBuilderPageComponent, canActivate: [courseOwnerOnlyGuard] },

    // General
    { path: "landing", component: LandingPageComponent },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: '**', redirectTo: '/landing' } // TODO: make this a PageNotFound or 404 error page
];
