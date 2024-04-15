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
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

/**
 * The sign in page component
 * 
 * Right now it has a single button for signing in, and prints the SuccessfulUserAuth result to the console.
 */
@Component({
    selector: 'signin-page',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule, MessagesModule, MessageModule, CardModule, ReactiveFormsModule, ButtonModule, CheckboxModule, RouterModule],
    templateUrl: './signin.page.component.html',
    styleUrl: './signin.page.component.css'
})
export class SignInPageComponent {
    errorMessage = "";

    signinForm = this.fb.group({
        email_address: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    constructor(private router: Router, private fb: FormBuilder, private oauthService: OAuth2Service) { }

    get email_address() {
        return this.signinForm.controls['email_address'];
    }

    get password() { return this.signinForm.controls['password']; }

    /**
     * Signs in the user using the login form information.
     */
    public signin(): void {
        const data = {
            username: this.signinForm.value.email_address,
            password: this.signinForm.value.password
        };

        this.oauthService.sign_in(data as SignInInfo).subscribe((res: SuccessfulUserAuth) => {
            this.router.navigate(['/dashboard']);
            window.location.reload();
        }, (error) => {
            //errors to account for -> wrong email or password
            this.errorMessage = 'Please check that your email and password are correct.';
        });
    }
}
