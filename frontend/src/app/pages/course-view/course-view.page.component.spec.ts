import { TestBed } from '@angular/core/testing';

import { CourseViewPageComponent } from './course-view.page.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture } from '@angular/core/testing';
import { routes } from './../../app.routes';
import { provideRouter } from '@angular/router';



describe('CourseViewPageComponent', () => {
    let component: CourseViewPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CourseViewPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter(routes)
            ]
        }).compileComponents();
        component = TestBed.createComponent(CourseViewPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });


});
