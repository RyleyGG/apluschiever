import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SignUpPageComponent } from './signup.page.component';
import { routes } from '../../app.routes';
import { provideRouter } from '@angular/router';

describe('SignUpPageComponent', () => {
    let component: SignUpPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SignUpPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter(routes)
            ]
        }).compileComponents();
        component = TestBed.createComponent(SignUpPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
