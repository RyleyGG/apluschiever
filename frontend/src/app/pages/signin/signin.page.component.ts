import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OAuth2Service } from '../../auth/oauth2.service';
import { SuccessfulUserAuth } from '../../core/models/auth.interface';
import { CheckboxModule } from 'primeng/checkbox';

/**
 * The sign in page component
 * 
 * Right now it has a single button for signing in, and prints the SuccessfulUserAuth result to the console.
 */
@Component({
    selector: 'signin-page',
    standalone: true,
    imports: [CommonModule, CheckboxModule],
    templateUrl: './signin.page.component.html',
    styleUrl: './signin.page.component.css'
})
export class SignInPageComponent {
    title = 'apluschiever'

    constructor(private oauthService: OAuth2Service) { }

    public signin(): void {
        // Sample of how to sign in
        this.oauthService.sign_in({
            email_address: 'hello-world@gmail.com',
            password: 'SAMPLE'
        }).subscribe((res: SuccessfulUserAuth) => {
            console.log(res);
        });
    }
}
