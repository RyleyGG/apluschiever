import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { OAuth2Service } from '../../auth/oauth2.service';
import { SuccessfulUserAuth } from '../../core/models/auth.interface';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { passwordMatchValidator } from '../../core/directives/password-match.directive';
import { CardModule } from 'primeng/card';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ReactiveFormsModule } from '@angular/forms';
import { SignUpInfo } from '../../core/models/auth.interface';
import { Router } from '@angular/router';
import { SignInInfo } from '../../core/models/auth.interface';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * The signup page component
 * 
 * Right now it has a single button for signing up, and prints the SuccessfulUserAuth result to the console.
 */
@Component({
    selector: 'signup-page',
    standalone: true,
    imports: [CommonModule, MessageModule, ToggleButtonModule, InputTextModule, MessagesModule, RouterLink, ReactiveFormsModule, CardModule, ButtonModule, FormsModule, PasswordModule, CheckboxModule],
    templateUrl: './signup.page.component.html',
    styleUrl: './signup.page.component.css'
})
export class SignUpPageComponent {
  public errorMessage = "";

  /**
   * The form storing all the data for the dynamic form.
   */
  public registerForm = this.fb.group({
    email_address: ['', [Validators.required, Validators.email]],
    first_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)]],
    last_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+(?: [a-zA-Z]+)*$/)]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
    user_type: new FormControl<boolean>(false)
  }, {
    validators: passwordMatchValidator
  });

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

  /**
   * Signs up the user based on the form data. If the signup is successful, the user is signed in to their new dashboard. 
   */
  public signup(): void {
    const data: SignInInfo = {
      username: this.registerForm.value.email_address!,
      password: this.registerForm.value.password!
    };

    const postData = {
      ...this.registerForm.value,
      // We custom overwrite the user_type based on the boolean from the form control.
      user_type: (this.registerForm.value.user_type?.valueOf() ? "Teacher" : "Student")
    };

    // Attempt to signup then sign in
    this.oauthService.sign_up(postData as SignUpInfo).subscribe((res: SuccessfulUserAuth) => {
      this.oauthService.sign_in(data).subscribe((res: SuccessfulUserAuth) => {
        this.router.navigate(['/dashboard']);
        window.location.reload();
      });
    }, (error) => {
      // Errors to account for -> email already exists
      if (error.status === 400) {
        this.errorMessage = 'This email address is already in use.';
      } else {
        this.errorMessage = 'There is an error with your sign-up. Please try again.';
        console.error('Other error:', error);
      }
    });
  }
}
