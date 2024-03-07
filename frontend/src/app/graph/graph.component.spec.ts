import { TestBed } from '@angular/core/testing';
import * as shape from 'd3-shape';

import { GraphComponent } from './graph.component';
import { Node } from './graph.interface';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

const testNodes: Node[] = [
    {
        'id': '1',
        'label': 'Test Node'
    },
    {
        'id': '2',
        'label': 'Test Node 2'
    }
];

const testEdges = [
    {}
];

describe('GraphComponent', () => {
    let component: GraphComponent;
    let fixture: any;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [GraphComponent],
            providers: [
                provideAnimationsAsync()
            ]
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

    it('Should update when layout or layout settings change', () => {
        spyOn(component as any, 'update');

        // There was a call to update initially when component was made, so we test for 2 and 3 times here
        component.layout.set("dagreCluster")
        fixture.detectChanges();
        expect((component as any).update).toHaveBeenCalledTimes(2);
    });

    it('Should update when graph view dependencies change', () => {
        spyOn(component as any, 'update');
        fixture.detectChanges();

        // There was a call to update initially when component was made
        fixture.componentRef.setInput('view', [1000, 500]);
        fixture.detectChanges();
        expect((component as any).update).toHaveBeenCalled();

        fixture.componentRef.setInput('nodes', [...testNodes, { 'id': '3', 'label': 'NEW NODE' }]);
        fixture.detectChanges();
        expect((component as any).update).toHaveBeenCalledTimes(3);

        fixture.componentRef.setInput('edges', [...testEdges, { 'id': 'e1', 'label': 'NEW EDGE' }]);
        fixture.detectChanges();
        expect((component as any).update).toHaveBeenCalledTimes(4);

        fixture.componentRef.setInput('clusters', [{ 'id': 'c1', 'label': 'NEW CLUSTER', 'childNodeIds': ['1', '2'] }]);
        fixture.detectChanges();
        expect((component as any).update).toHaveBeenCalledTimes(5);

        component.curve.set(shape.curveBundle.beta(0.5));
        fixture.detectChanges();
        expect((component as any).update).toHaveBeenCalledTimes(6);
    });

    it('should emit nodeClicked event when onNodeClick is called', () => {
        // Create a spy on the emit method of the EventEmitter
        spyOn(component.nodeClicked, 'emit');

        // Define a mock MouseEvent and Node
        const mockMouseEvent = new MouseEvent('click');

        // Call the onNodeClick method with the mock parameters
        component.onNodeClick(mockMouseEvent, testNodes[0]);

        // Expect that the emit method was called with the correct node
        expect(component.nodeClicked.emit).toHaveBeenCalledWith(testNodes[0]);
    });

    //#region Zooming Tests

    it('Should zoom and notify when the zoom level changes', () => {
        spyOn(component.zoomLevelUpdated, 'emit');
        spyOn(component as any, 'zoomTo'); // As any magic makes spying on private function possible

        component.zoomLevel.set(2);
        fixture.detectChanges();
        expect((component as any).zoomTo).toHaveBeenCalled();
        expect(component.zoomLevelUpdated.emit).toHaveBeenCalledWith(2);

        component.zoomLevel.set(0.1);
        fixture.detectChanges();
        expect((component as any).zoomTo).toHaveBeenCalled();
        expect(component.zoomLevelUpdated.emit).toHaveBeenCalledWith(0.1);
    });

    it('Should zoom to fit when told', () => {
        spyOn(component as any, 'zoomToFit');

        component.zoomToFitTrigger.set('trigger');
        fixture.detectChanges();
        expect((component as any).zoomToFit).toHaveBeenCalled();
    });

    it('Should not zoom beyond maximum constraints', () => {
        component.zoomLevel.set(1000000);
        fixture.detectChanges();
        expect(component.zoomLevel()).toEqual(component.maxZoomLevel());

        component.zoomLevel.set(0.000001);
        fixture.detectChanges();
        expect(component.zoomLevel()).toEqual(component.minZoomLevel());
    });

    //#endregion Zooming Tests

    //#region Panning Tests

    it('Should pan when offsets are updated', () => {
        spyOn(component as any, 'panTo');

        fixture.componentRef.setInput('panOffsetX', 100);
        fixture.detectChanges();
        expect((component as any).panTo).toHaveBeenCalled();

        fixture.componentRef.setInput('panOffsetY', 100);
        fixture.detectChanges();
        expect((component as any).panTo).toHaveBeenCalled();

        fixture.componentRef.setInput('panOffsetX', 50);
        fixture.componentRef.setInput('panOffsetX', 200);
        fixture.detectChanges();
        expect((component as any).panTo).toHaveBeenCalled();
    });

    it('Should pan to a node when told', () => {
        spyOn(component as any, 'panToNodeId');

        fixture.componentRef.setInput('panToNode', testNodes[0]);
        fixture.detectChanges();
        expect((component as any).panToNodeId).toHaveBeenCalledWith(testNodes[0]);

        fixture.componentRef.setInput('panToNode', testNodes[1]);
        fixture.detectChanges();
        expect((component as any).panToNodeId).toHaveBeenCalledWith(testNodes[1]);
    });

    //#endregion Panning Tests

});
