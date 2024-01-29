import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node, Edge, Cluster } from './graph.interface';

/**
 * The main application component, currently the sample hello world page.
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

    // Public Properties & Computed Values
    width = computed(() => { });
    height = computed(() => { });

    // Private Properties

    constructor() {

    }

    //#region Helper Methods

    private getParentDimensions(): void {

    }

    private zoom(factor: number): void {

    }

    private zoomTo(level: number): void {

    }

    private zoomToFit(): void {

    }

    private pan(x: number, y: number): void {

    }

    private panTo(x: number, y: number): void {

    }

    private panToNodeId(id: string): void {

    }

    //#endregion Helper Methods
}
