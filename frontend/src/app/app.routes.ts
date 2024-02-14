import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { signedInGuard, signedOutGuard } from './auth/oauth2.guard';

import { SignInPageComponent } from './pages/signin/signin.page.component';
import { LandingPageComponent } from './pages/landing/landing.page.component';
import { SignUpPageComponent } from './pages/signup/signup.page.component';
import { SignOutPageComponent } from './pages/signout/signout.page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NavbarComponent } from './components/navbar/navbar.component';

export const routes: Routes = [
    // Routes for authentication (TODO: replace component with proper pages, etc)
    { path: "signup", component: SignUpPageComponent, canActivate: [signedOutGuard] },
    { path: "signin", component: SignInPageComponent, canActivate: [signedOutGuard] },
    { path: "signout", component: SignOutPageComponent, canActivate: [signedInGuard] },
    { path: "dashboard", component: DashboardComponent, canActivate: [signedInGuard] },
    // General routes
    { path: "landing", component: LandingPageComponent },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: '**', component: AppComponent } // TODO: make this a PageNotFound or 404 error page
];
