import { TestBed } from '@angular/core/testing';

import { GraphComponent } from './graph.component';

const testNodes = [
    {}
];

const testEdges = [
    {}
];

describe('GraphComponent', () => {
    let component: GraphComponent;
    let fixture: any;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GraphComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GraphComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('nodes', testNodes);
        fixture.componentRef.setInput('edges', testEdges);
        fixture.detectChanges();
    });


    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('Should set width and height according to component input view', () => {
        fixture.componentRef.setInput('view', [1000, 500]);
        fixture.detectChanges();

        expect(component.width()).toEqual(1000);
        expect(component.height()).toEqual(500);

        fixture.componentRef.setInput('view', [600, 300]);
        fixture.detectChanges();

        expect(component.width()).toEqual(600);
        expect(component.height()).toEqual(300);
    });
});
