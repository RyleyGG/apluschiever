import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { FullscreenComponent } from '../fullscreen/fullscreen.component';
import { ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from 'primeng/dragdrop';
import {Markdown, Video} from "../../core/models/node-content.interface";
import { Node } from "../../graph/graph.interface";
import { NodeService } from '../../core/services/node/node.service';
import { DragdropDirective } from '../../core/directives/dragdrop.directive';

@Component({
  selector: 'app-fileviewer',
  standalone: true,
  imports: [ButtonModule, FullscreenComponent, DragdropDirective, CommonModule, DragDropModule],
  templateUrl: './fileviewer.component.html',
  styleUrl: './fileviewer.component.css'
})
export class FileviewerComponent {
  value = false;
  minimize = false;
  makefull(value: boolean) {
    this.value = value;
  }
}
