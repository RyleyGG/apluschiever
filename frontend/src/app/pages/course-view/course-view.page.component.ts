import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphComponent } from '../../graph/graph.component';

/**
 * The sign in page component
 * 
 * Right now it has a single button for signing in, and prints the SuccessfulUserAuth result to the console.
 */
@Component({
    selector: 'course-view-page',
    standalone: true,
    imports: [CommonModule, GraphComponent],
    templateUrl: './course-view.page.component.html',
    styleUrl: './course-view.page.component.css'
})
export class CourseViewPageComponent {

    constructor() {
        console.log("hi")
    }

    onNodeSelect(event: any) {
        console.log(event);
    }
}
