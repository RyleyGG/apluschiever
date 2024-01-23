import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { signinGuard, signoutGuard, signupGuard } from './auth/oauth2.guard';
import { LoginPageComponent } from './pages/login/login.page.component';
import { LandingPageComponent } from './pages/landing/landing.page.component';

export const routes: Routes = [
    // Routes for authentication (TODO: replace component with proper pages, etc)
    { path: "signup", component: AppComponent, canActivate: [signupGuard] },
    { path: "signin", component: LoginPageComponent, canActivate: [signinGuard] },
    { path: "signout", component: AppComponent, canActivate: [signoutGuard] },

    // General routes
    { path: "landing", component: LandingPageComponent },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: '**', component: AppComponent } // TODO: make this a PageNotFound or 404 error page
];
