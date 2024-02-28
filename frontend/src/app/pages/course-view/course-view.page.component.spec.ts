import { TestBed } from '@angular/core/testing';

import { CourseViewPageComponent } from './course-view.page.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('CourseViewPageComponent', () => {
    let component: CourseViewPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CourseViewPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        }).compileComponents();
        component = TestBed.createComponent(CourseViewPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
