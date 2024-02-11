import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { signinGuard, signoutGuard, signupGuard } from './auth/oauth2.guard';

import { SignInPageComponent } from './pages/signin/signin.page.component';
import { LandingPageComponent } from './pages/landing/landing.page.component';
import { SignUpPageComponent } from './pages/signup/signup.page.component';
import { SignOutPageComponent } from './pages/signout/signout.page.component';
import { CourseViewPageComponent } from './pages/course-view/course-view.page.component';

export const routes: Routes = [
    // Routes for authentication (TODO: replace component with proper pages, etc)
    { path: "signup", component: SignUpPageComponent, canActivate: [signupGuard] },
    { path: "signin", component: SignInPageComponent, canActivate: [signinGuard] },
    { path: "signout", component: SignOutPageComponent, canActivate: [signoutGuard] },

    // Routes for course based thing (TODO: add guard for this component)
    { path: "viewer", component: CourseViewPageComponent },

    // General routes
    { path: "landing", component: LandingPageComponent },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: '**', component: AppComponent } // TODO: make this a PageNotFound or 404 error page
];
