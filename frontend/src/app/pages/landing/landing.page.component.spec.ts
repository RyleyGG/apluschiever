import { TestBed } from '@angular/core/testing';

import { LandingPageComponent } from './landing.page.component';

describe('LandingPageComponent', () => {
    let component: LandingPageComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LandingPageComponent]
        }).compileComponents();
        component = TestBed.createComponent(LandingPageComponent).componentInstance;
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
