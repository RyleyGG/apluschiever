import { TestBed } from '@angular/core/testing';

import { CourseBuilderPageComponent } from './course-builder.page.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from '../../app.routes';
import { provideRouter } from '@angular/router';



describe('CourseBuilderPageComponent', () => {
    let component: CourseBuilderPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CourseBuilderPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter(routes)
            ]
        }).compileComponents();
        component = TestBed.createComponent(CourseBuilderPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });


});
