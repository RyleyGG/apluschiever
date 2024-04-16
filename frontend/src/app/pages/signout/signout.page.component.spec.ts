import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SignOutPageComponent } from './signout.page.component';
import { routes } from '../../app.routes';
import { provideRouter } from '@angular/router';

describe('SignOutPageComponent', () => {
    let component: SignOutPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SignOutPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter(routes)
            ]
        }).compileComponents();
        component = TestBed.createComponent(SignOutPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
