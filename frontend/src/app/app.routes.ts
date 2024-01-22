import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { signinGuard, signoutGuard, signupGuard } from './auth/oauth2.guard';

export const routes: Routes = [
    // Routes for authentication (TODO: replace component with proper pages, etc)
    { path: "sign_up", component: AppComponent, canActivate: [signupGuard] },
    { path: "sign_in", component: AppComponent, canActivate: [signinGuard] },
    { path: "sign_out", component: AppComponent, canActivate: [signoutGuard] },

    // General routes
    { path: "landing", component: AppComponent },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: '**', component: AppComponent } // TODO: make this a PageNotFound or 404 error page
];
