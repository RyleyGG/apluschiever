import { Component, ElementRef, computed, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node, Edge, Cluster } from './graph.interface';
import { identity, scale, smoothMatrix, toSVG, transform, translate } from 'transformation-matrix';

interface Matrix {
    a: number, // zoom level
    b: number,
    c: number,
    d: number,
    e: number, // x position
    f: number  // y position
};

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
    private transformationMatrix: Matrix = identity();
    private transform: string = '';

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

    //#region Drag Node Methods

    private onDrag(event: MouseEvent): void {
        // Check that drag is enabled
        if (!this.dragEnabled()) {
            return;
        }


    }

    //#endregion Drag Node Methods

    //#region Pan Methods

    private onPan(): void {
        // Check that pan is enabled
        if (!this.panEnabled()) {
            return;
        }

    }

    private pan(x: number, y: number, ignoreZoomLevel: boolean = false): void {
        const zoomLevel = ignoreZoomLevel ? 1 : this.zoomLevel();
        this.transformationMatrix = transform(this.transformationMatrix, translate(x / zoomLevel, y / zoomLevel));
        this.updateTransform();
    }

    private panTo(x: number, y: number): void {

    }

    private panToNodeId(id: string): void {

    }

    //#endregion Pan Methods

    //#region Zoom Methods

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
        this.transformationMatrix = transform(this.transformationMatrix, scale(factor, factor));
        this.updateTransform();
    }

    private zoomTo(level: number): void {

    }

    private zoomToFit(): void {

    }

    //#endregion Zoom Methods

    private updateTransform(): void {
        this.transform = toSVG(smoothMatrix(this.transformationMatrix, 100));
    }

    //#endregion Helper Methods
}
