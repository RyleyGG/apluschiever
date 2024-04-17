import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { OAuth2Service } from "../../auth/oauth2.service";
import { firstValueFrom } from 'rxjs';

/**
 * The landing page component, it is an 'advertising' page of sorts.
 */
@Component({
    selector: 'landing-page',
    standalone: true,
    imports: [CommonModule, ButtonModule, RouterLink],
    templateUrl: './landing.page.component.html',
    styleUrl: './landing.page.component.css'
})
export class LandingPageComponent implements OnInit {
    constructor(private oauthService: OAuth2Service, private router: Router) {}

  async ngOnInit() {
    try {
      const isUserAuthenticated = await firstValueFrom(this.oauthService.validate_token());
      if (isUserAuthenticated) {
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Error checking user login status:', error);
    }
  }
    title = 'apluschiever';

    /**
     * Scrolls the screen smoothly to the specified component/element.
     * 
     * @param componentId the component/element id to scroll to
     */
    scrollToComponent(componentId: string): void {
        const element = document.getElementById(componentId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

}
