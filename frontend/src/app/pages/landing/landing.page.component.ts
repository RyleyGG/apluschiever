import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

/**
 * The landing page component
 * 
 * Right now, just displays the template 'hello-world' application. In future, will probably be the 'advertising' page.
 */
@Component({
    selector: 'landing-page',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    templateUrl: './landing.page.component.html',
    styleUrl: './landing.page.component.css'
})
export class LandingPageComponent {
    title = 'apluschiever'
}
