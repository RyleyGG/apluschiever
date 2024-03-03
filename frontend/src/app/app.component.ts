import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme/theme.service';
import { InternetConnectionService } from './core/services/internet-connection/internet-connection.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MenubarModule } from 'primeng/menubar';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
/**
 * The main application component, currently the sample hello world page.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ToggleButtonModule, DialogModule, MenubarModule, RouterOutlet, NavbarComponent, ButtonModule, RouterLink, RouterLinkActive],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'apluschiever';

  constructor(private internetConnection: InternetConnectionService) {
    console.log(this.internetConnection.isOnline());
  }
}
