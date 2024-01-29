import { Component, ElementRef, computed, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node, Edge, Cluster } from './graph.interface';

/**
 * The graph component.
 */
@Component({
    selector: 'graph',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './graph.component.html',
    styleUrl: './graph.component.css'
})
export class GraphComponent {
    // General Graph Inputs
    view = input<number[]>();
    nodes = input.required<Node[]>();
    edges = input.required<Edge[]>();
    clusters = input<Cluster[]>([]);

    // Drag Node Graph Inputs
    dragEnabled = input<boolean>(true);

    // Graph Panning Inputs
    panEnabled = input<boolean>(true);
    panOffsetX = input<number>();
    panOffsetY = input<number>();
    panningAxis = input<'horizontal' | 'vertical' | 'both'>('both');
    panToNode = input<string>(); // Accepts Node ID

    // Graph Zoom Inputs
    zoomEnabled = input<boolean>(true);
    zoomSpeed = input<number>(0.1);
    zoomLevel = input<number>(1);
    minZoomLevel = input<number>(0.1);
    maxZoomLevel = input<number>(5);
    panOnZoom = input<boolean>(true);

    // Public Properties & Computed Values
    width = computed(() => { });
    height = computed(() => { });

    // Private Properties

    constructor(private el: ElementRef) {


        // Setup the effect for pan to node functionality
        effect(() => {
            const nodeId = this.panToNode();
            if (!nodeId) { return; }
            this.panToNodeId(nodeId);
        })
    }

    //#region Helper Methods

    private getParentDimensions(): void {

    }

    private onDrag(): void {

    }

    private onPan(): void {

    }

    private pan(x: number, y: number, ignoreZoomLevel: boolean = false): void {
        const zoomLevel = ignoreZoomLevel ? 1 : this.zoomLevel();

    }

    private panTo(x: number, y: number): void {

    }

    private panToNodeId(id: string): void {

    }

    private onZoom($event: WheelEvent, direction: any): void {
        // Check that zoom is enabled
        if (!this.zoomEnabled()) {
            return;
        }

        const zoomFactor = 1 + (direction === 'in' ? this.zoomSpeed() : -this.zoomSpeed());

        // Check we won't go out of bounds
        const newZoomLevel = this.zoomLevel() * zoomFactor;
        if (newZoomLevel <= this.minZoomLevel() || newZoomLevel >= this.maxZoomLevel()) {
            return;
        }

        // Apply the actual zoom
        if (this.panOnZoom() && $event) {
            // Absolute mouse X/Y on the screen
            const mouseX = $event.clientX;
            const mouseY = $event.clientY;

            // Transform to SVG X/Y
            const svg = this.el.nativeElement.querySelector('svg');
            const svgGroup = svg.querySelector('g.chart');

            // Create a SVG point
            const point = svg.createSVGPoint();
            point.x = mouseX;
            point.y = mouseY;
            const svgPoint = point.matrixTransform(svgGroup.getScreenCTM().inverse());

            // Pan around SVG, zoom, then unpan
            this.pan(svgPoint.x, svgPoint.y, true);
            this.zoom(zoomFactor);
            this.pan(-svgPoint.x, -svgPoint.y, true);
        } else {
            this.zoom(zoomFactor);
        }
    }

    private zoom(factor: number): void {

    }

    private zoomTo(level: number): void {

    }

    private zoomToFit(): void {

    }

    //#endregion Helper Methods
}
