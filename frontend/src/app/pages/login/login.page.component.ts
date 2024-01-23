import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { OAuth2Service } from '../../auth/oauth2.service';
import { SuccessfulUserAuth } from '../../core/models/Auth';

/**
 * The login page component
 */
@Component({
    selector: 'login-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.page.component.html',
    styleUrl: './login.page.component.css'
})
export class LoginPageComponent {
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

    public signout(): void {
        // Sample of how to sign out
        this.oauthService.sign_out();
    }
}
