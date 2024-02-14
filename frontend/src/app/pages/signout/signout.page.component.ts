import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OAuth2Service } from '../../auth/oauth2.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SignInInfo } from '../../core/models/auth.interface';
import { FormsModule } from '@angular/forms'; 
import { CardModule } from 'primeng/card';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * The sign out page component
 * 
 * Right now it has a single button for signing out in.
 */
@Component({
    selector: 'signout-page',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, CheckboxModule],
    templateUrl: './signout.page.component.html',
    styleUrl: './signout.page.component.css'
})
export class SignOutPageComponent {
    title = 'Sign-Out Page'

    constructor(private router: Router, private oauthService: OAuth2Service) { }

    public signout(): void {
        this.oauthService.sign_out();
        this.router.navigate(['/landing']);
        window.location.reload();
    }
}
