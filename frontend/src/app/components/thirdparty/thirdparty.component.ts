import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-thirdparty',
  standalone: true,
  imports: [],
  templateUrl: './thirdparty.component.html',
  styleUrl: './thirdparty.component.css'
})
export class ThirdpartyComponent {
  @Input() param: string | any;
  constructor(private sanitizer: DomSanitizer) {}
  getURL(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.param);
  }
}
