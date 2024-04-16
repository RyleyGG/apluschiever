import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OAuth2Service } from '../../auth/oauth2.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/**
 * The sign out page component
 * 
 * Right now it has a single button for signing out in.
 */
@Component({
    selector: 'signout-page',
    standalone: true,
    imports: [RouterLink, CommonModule, ButtonModule, CardModule, CheckboxModule],
    templateUrl: './signout.page.component.html',
    styleUrl: './signout.page.component.css'
})
export class SignOutPageComponent {
    constructor(private router: Router, private oauthService: OAuth2Service) { }

    /**
     * Signs out the user.
     */
    public signout(): void {
        this.oauthService.sign_out();
        this.router.navigate(['/landing']);
        window.location.reload();
    }
}
