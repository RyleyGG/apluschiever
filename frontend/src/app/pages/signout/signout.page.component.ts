import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OAuth2Service } from '../../auth/oauth2.service';
import { CheckboxModule } from 'primeng/checkbox';

/**
 * The sign out page component
 * 
 * Right now it has a single button for signing out in.
 */
@Component({
    selector: 'signout-page',
    standalone: true,
    imports: [CommonModule, CheckboxModule],
    templateUrl: './signout.page.component.html',
    styleUrl: './signout.page.component.css'
})
export class SignOutPageComponent {
    title = 'apluschiever'

    constructor(private oauthService: OAuth2Service) { }

    public signout(): void {
        // Sample of how to sign out
        this.oauthService.sign_out();
    }
}
