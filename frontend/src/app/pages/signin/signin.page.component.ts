import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OAuth2Service } from '../../auth/oauth2.service';
import { SuccessfulUserAuth } from '../../core/models/auth.interface';
import { CheckboxModule } from 'primeng/checkbox';
import { FormBuilder, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SignInInfo } from '../../core/models/auth.interface';
import { FormsModule } from '@angular/forms'; 
import { CardModule } from 'primeng/card';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';

/**
 * The sign in page component
 * 
 * Right now it has a single button for signing in, and prints the SuccessfulUserAuth result to the console.
 */
@Component({
    selector: 'signin-page',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ReactiveFormsModule, ButtonModule, CheckboxModule],
    templateUrl: './signin.page.component.html',
    styleUrl: './signin.page.component.css'
})
export class SignInPageComponent {
    signinForm = this.fb.group({
        email_address: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
      })
    title = 'Sign-In Page'

    constructor(private router: Router, private fb: FormBuilder, private oauthService: OAuth2Service) { }

    get email_address() {
        return this.signinForm.controls['email_address'];
      }
      get password() { return this.signinForm.controls['password']; }

    public signin(): void {
        const data = this.signinForm.value;
        this.oauthService.sign_in( data as SignInInfo ).subscribe((res: SuccessfulUserAuth) => {
            console.log(res);
            this.router.navigate(['/dashboard']);
            window.location.reload();
        }
        );
    }
}
