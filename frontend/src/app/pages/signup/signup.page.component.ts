import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OAuth2Service } from '../../auth/oauth2.service';
import { SuccessfulUserAuth } from '../../core/models/auth.interface';

/**
 * The signup page component
 * 
 * Right now it has a single button for signing up, and prints the SuccessfulUserAuth result to the console.
 */
@Component({
    selector: 'signup-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './signup.page.component.html',
    styleUrl: './signup.page.component.css'
})
export class SignUpPageComponent {
    title = 'apluschiever'

    constructor(private oauthService: OAuth2Service) { }

    public signup(): void {
        // Sample of how to sign up
        this.oauthService.sign_up({
            email_address: 'hello-world@gmail.com',
            password: 'SAMPLE',
            first_name: 'TEST FIRST NAME',
            last_name: 'TEST LAST NAME'
        }).subscribe((res: SuccessfulUserAuth) => {
            console.log(res);
        });
    }
}
