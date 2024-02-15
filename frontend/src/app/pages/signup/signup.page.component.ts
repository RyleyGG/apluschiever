import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, Validators } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { OAuth2Service } from '../../auth/oauth2.service';
import { SuccessfulUserAuth } from '../../core/models/auth.interface';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms'; 
import { passwordMatchValidator } from '../../core/directives/password-match.directive';
import { CardModule } from 'primeng/card';
import { ReactiveFormsModule } from '@angular/forms';
import { SignUpInfo } from '../../core/models/auth.interface';
import { Router } from '@angular/router';
import { SignInInfo } from '../../core/models/auth.interface';
/**
 * The signup page component
 * 
 * Right now it has a single button for signing up, and prints the SuccessfulUserAuth result to the console.
 */
@Component({
    selector: 'signup-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, FormsModule, PasswordModule, CheckboxModule],
    templateUrl: './signup.page.component.html',
    styleUrl: './signup.page.component.css'
})
export class SignUpPageComponent {
    title = 'Sign-Up Page'

    registerForm = this.fb.group({
        email_address: ['', [Validators.required, Validators.email]],
        first_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)]],
        last_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      }, {
        validators: passwordMatchValidator
      })

    constructor(private router: Router, private fb: FormBuilder, private oauthService: OAuth2Service) { }
    get first_name() {
        return this.registerForm.controls['first_name'];
      }
      get last_name() {
        return this.registerForm.controls['last_name'];
      }
    
      get email_address() {
        return this.registerForm.controls['email_address'];
      }
    
      get password() {
        return this.registerForm.controls['password'];
      }
    
      get confirmPassword() {
        return this.registerForm.controls['confirmPassword'];
      }
    public signup(): void {
        // Sample of how to sign up
        const postData = { ...this.registerForm.value };
        this.oauthService.sign_up(postData as SignUpInfo).subscribe((res: SuccessfulUserAuth) => {
            console.log(res);
            this.oauthService.sign_in( postData as SignInInfo ).subscribe((res: SuccessfulUserAuth) => {
                console.log(res);
                this.router.navigate(['/dashboard']);
                window.location.reload();
            })
        });
    }
}
