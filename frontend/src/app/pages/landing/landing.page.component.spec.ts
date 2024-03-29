import { TestBed } from '@angular/core/testing';

import { LandingPageComponent } from './landing.page.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';

describe('LandingPageComponent', () => {
    let component: LandingPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LandingPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter(routes)
            ]
        }).compileComponents();
        component = TestBed.createComponent(LandingPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
