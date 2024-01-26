import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterOutlet } from '@angular/router';
import { InternetConnectionService } from './core/services/internet-connection/internet-connection.service';
import { ThemeService } from './core/services/theme/theme.service';

/**
 * The main application component, currently the sample hello world page.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'apluschiever';

  constructor(private themeService: ThemeService, private internetConnection: InternetConnectionService) {
    console.log(this.internetConnection.isOnline());
  }

  /**
   * Sample method for testing. Shows how to use the theme service to read the theme, and update 
   * the theme to a new one.
   */
  swapTheme(): void {
    const newTheme = this.themeService.theme() == 'arya-blue' ? 'saga-blue' : 'arya-blue';
    this.themeService.setTheme(newTheme);
  }
}
