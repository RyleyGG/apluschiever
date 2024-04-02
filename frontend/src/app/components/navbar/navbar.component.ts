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
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DividerModule } from 'primeng/divider';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../core/services/user/user.service';
import { User } from '../../core/models/user.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ButtonModule, RouterLink, OverlayPanelModule, DividerModule, ToolbarModule, MenubarModule, RouterOutlet, ToolbarModule, RouterLinkActive, ToggleButtonModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: 'navbar.component.css'
})
export class NavbarComponent implements OnInit {
  loggedIn: boolean = false;
  loggedInUser: User | null = null;

  async ngOnInit() {
    try {
      const isUserAuthenticated = await firstValueFrom(this.oauthService.validate_token());
      this.loggedIn = isUserAuthenticated;
    } catch (error) {
      console.error('Error checking user login status:', error);
    }

    this.userService.getCurrentUser().subscribe((data) => {
      this.loggedInUser = data;
    });
  }

  constructor(private oauthService: OAuth2Service, private themeService: ThemeService, private userService: UserService, private internetConnection: InternetConnectionService) {
    console.log(this.internetConnection.isOnline());
  }

  swapTheme(): void {
    const newTheme = this.themeService.theme() == 'arya-blue' ? 'saga-blue' : 'arya-blue';
    this.themeService.setTheme(newTheme);
  }
}
