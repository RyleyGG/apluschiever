import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { InternetConnectionService } from '../../core/services/internet-connection/internet-connection.service';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { MenubarModule } from 'primeng/menubar';
import { OAuth2Service } from "../../auth/oauth2.service";
import { firstValueFrom } from 'rxjs';
import { LocalStorageService } from '../../core/services/local-storage/local-storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, RouterLink, ToolbarModule, MenubarModule, RouterOutlet, ToolbarModule, RouterLinkActive, ToggleButtonModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: 'navbar.component.css'
})
export class NavbarComponent implements OnInit {
  title = 'apluschiever';
  loggedIn: boolean = false;

  constructor(private oauthService: OAuth2Service, private themeService: ThemeService, private localStorageService: LocalStorageService, private internetConnection: InternetConnectionService) {
    console.log(this.internetConnection.isOnline());
  }

  async ngOnInit() {
    try {
      const isUserAuthenticated = await firstValueFrom(this.oauthService.validate_token());
      if (isUserAuthenticated) {
        this.loggedIn = true;
      }
      else {
        this.loggedIn = false;
      }
    } catch (error) {
      console.error('Error checking user login status:', error);
    }
  }

  /**
   * Updates the in use theme for the application (light vs dark).
   */
  swapTheme(): void {
    const newTheme = this.themeService.theme() == 'arya-blue' ? 'saga-blue' : 'arya-blue';
    this.themeService.setTheme(newTheme);
    this.localStorageService.set("theme", newTheme);
  }
}
