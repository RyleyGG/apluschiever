import { TestBed } from '@angular/core/testing';

import { CourseViewPageComponent } from './course-view.page.component';

describe('CourseViewPageComponent', () => {
    let component: CourseViewPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CourseViewPageComponent]
        }).compileComponents();
        component = TestBed.createComponent(CourseViewPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
