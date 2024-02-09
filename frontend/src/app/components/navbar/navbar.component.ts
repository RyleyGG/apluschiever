import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { InternetConnectionService } from '../../core/services/internet-connection/internet-connection.service';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { MenubarModule } from 'primeng/menubar';
import { PrimeNGConfig, MenuItem } from "primeng/api"; 
import { OAuth2Service } from "../../auth/oauth2.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, RouterLink, MenubarModule, RouterOutlet, ToolbarModule, RouterLinkActive, ToggleButtonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  title = 'apluschiever';
  
  constructor(private oauthService: OAuth2Service, private themeService: ThemeService, private internetConnection: InternetConnectionService) {
    console.log(this.internetConnection.isOnline());
  }
  darkTheme = false;
  buttonLabel = 'Light Mode'; // Initial button label
  items = [
    { label: 'Home', icon: 'pi pi-home', routerLink: '/dashboard'},
    { label: 'Sign-In', icon: 'pi pi-sign-in', routerLink: '/signin'},
    { label: 'Sign-Out', icon: 'pi pi-sign-out', routerLink: '/signout' },
    { label: 'Sign-Up', icon: 'pi pi-user', routerLink: '/signup' },
    {
      label: 'Light',
      icon: 'pi pi-bolt',
      command: () => this.swapTheme(),
      template: '<p-toggleButton (click)="swapTheme()" onLabel="Dark" offLabel="Light"></p-toggleButton>  '
    }
    // Add more menu items as needed
  ];
  
  
  /**
   * Sample method for testing. Shows how to use the theme service to read the theme, and update 
   * the theme to a new one.
   */
  swapTheme(): void {
    this.darkTheme = !this.darkTheme;
    this.buttonLabel = this.darkTheme ? 'Dark Mode' : 'Light Mode';
    const newTheme = this.themeService.theme() == 'arya-blue' ? 'saga-blue' : 'arya-blue';
    this.themeService.setTheme(newTheme);
  }
}
