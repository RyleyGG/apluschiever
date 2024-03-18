import { Component } from '@angular/core';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  templateUrl: './video.component.html',
  styleUrl: './video.component.css'
})
export class VideoComponent {
  videoUrl = "https://youtu.be/fov2mcNZPmc?si=f-e5sRvzmBCJ0eot";
}
