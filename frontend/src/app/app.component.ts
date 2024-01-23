import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { InternetConnectionService } from './core/services/internet-connection/internet-connection.service';
import { OAuth2Service } from './auth/oauth2.service';

/**
 * The main application component, currently the sample hello world page.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'apluschiever';

  constructor(private oauthService: OAuth2Service) {
    oauthService.sign_in({
      email_address: 'hello-world@gmail.com',
      password: 'SAMPLE'
    });
  }
}
