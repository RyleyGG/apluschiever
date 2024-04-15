import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SignInPageComponent } from './signin.page.component';
import { routes } from '../../app.routes';
import { provideRouter } from '@angular/router';

describe('SignInPageComponent', () => {
    let component: SignInPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SignInPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter(routes)
            ]
        }).compileComponents();
        component = TestBed.createComponent(SignInPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
