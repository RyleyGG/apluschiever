import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SignUpPageComponent } from './signup.page.component';

describe('SignUpPageComponent', () => {
    let component: SignUpPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SignUpPageComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        }).compileComponents();
        component = TestBed.createComponent(SignUpPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
