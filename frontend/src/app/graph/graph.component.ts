import { Component, ContentChild, ElementRef, HostListener, QueryList, TemplateRef, ViewChildren, computed, effect, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node, Edge, Cluster, Graph } from './graph.interface';
import { identity, scale, smoothMatrix, toSVG, transform, translate } from 'transformation-matrix';

/**
 * Interface for a matrix, used by GraphComponent internally.
 */
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
    panningAxis = input<'horizontal' | 'vertical' | 'both'>('both'); // TODO: maybe make enum
    panToNode = input<string>(); // Accepts Node ID

    // Graph Zoom Inputs
    zoomEnabled = input<boolean>(true);
    zoomSpeed = input<number>(0.1);
    zoomLevel = input<number>(1);
    minZoomLevel = input<number>(0.1);
    maxZoomLevel = input<number>(5);
    panOnZoom = input<boolean>(true);

    // Public Properties & Computed Values
    width = computed(() => {
        // Try setting width through the input property view()
        // If that fails then try getting parent
        // If that fails use a default
        return Math.floor((this.view() || this.getParentDimensions() || [600, 400])[0]);
    });
    height = computed(() => {
        // Try setting height through the input property view()
        // If that fails then try getting parent
        // If that fails use a default
        return Math.floor((this.view() || this.getParentDimensions() || [600, 400])[1]);
    });

    // Private Properties
    private transformationMatrix = signal<Matrix>(identity());
    private transform = computed(() => toSVG(smoothMatrix(this.transformationMatrix(), 100)));

    private graph!: Graph; // Initialized within the createGraph() method, which is called in constructor.

    private isDragging: boolean = false;
    private isPanning: boolean = false;

    @ContentChild('nodeTemplate') nodeTemplate!: TemplateRef<any>;
    @ContentChild('edgeTemplate') edgeTemplate!: TemplateRef<any>;
    @ContentChild('clusterTemplate') clusterTemplate!: TemplateRef<any>;
    @ContentChild('defsTemplate') defsTemplate!: TemplateRef<any>;

    @ViewChildren('nodeElement') nodeElements!: QueryList<ElementRef>;
    @ViewChildren('edgeElement') edgeElements!: QueryList<ElementRef>;

    /**
     * Creates the GraphComponent.
     * 
     * @param { ElementRef } el a reference to itself in the HTML DOM, injected by Angular.
     */
    constructor(private el: ElementRef) {
        // Setup the effect for zoom functionality
        effect(() => {
            this.zoomTo(this.zoomLevel());
        });

        // Setup the effect for pan offset functionality
        effect(() => {
            this.panTo(this.panOffsetX() || 0, this.panOffsetY() || 0);
        });

        // Setup the effect for pan to node functionality
        effect(() => {
            const nodeId = this.panToNode();
            if (!nodeId) { return; }
            this.panToNodeId(nodeId);
        });

        this.createGraph();
    }

    //#region Host Listener Functions

    /**
     * A function which fires on each mouse movement. Needed to allow panning and dragging of nodes.
     * 
     * @param {MouseEvent} $event the event which triggered this function call
     */
    @HostListener('document:mousemove', ['$event'])
    private onMouseMove($event: MouseEvent): void {
        if (this.isPanning && this.panEnabled()) {
            this.onPan($event);
        } else if (this.isDragging && this.dragEnabled()) {
            this.onDrag($event);
        }
    }

    /**
     * A function which fires on each mouse down event. Needed to allow panning and dragging of nodes.
     * 
     * @param { MouseEvent } $event the event which triggered this function call 
     */
    @HostListener('document:mousedown', ['$event'])
    private onMouseDown($event: MouseEvent): void {

    }

    /**
     * A function which fires on each mouse click event. 
     * 
     * @param { MouseEvent } $event the event which triggered this function call 
     */
    @HostListener('document:mouseclick', ['$event'])
    private onMouseClick($event: MouseEvent): void {

    }

    /**
     * A function which fires on each mouse up event. Needed to allow panning and dragging of nodes.
     * 
     * @param { MouseEvent } $event the event which triggered this function call 
     */
    @HostListener('document:mouseup', ['$event'])
    private onMouseUp($event: MouseEvent): void {
        this.isDragging = false;
        this.isPanning = false;
        // Call on drag end for whatever drawing software is put in place.
    }

    //#endregion Host Listener Functions

    //#region Helper Methods

    private createGraph(): void {
        const initNode = (n: Node): Node => {
            // Set default settings for the nodes here.
            return n;
        };

        const initEdge = (e: Edge): Edge => {
            // Set default settings for the edges here.
            return e;
        };

        const initCluster = (c: Cluster): Cluster => {
            // Set default settings for the clusters here.
            return c;
        };

        this.graph = {
            nodes: this.nodes().length > 0 ? [...this.nodes()].map(initNode) : ([] as Node[]),
            edges: this.edges().length > 0 ? [...this.edges()].map(initEdge) : ([] as Edge[]),
            clusters: this.clusters().length > 0 ? [...this.clusters()].map(initCluster) : ([] as Cluster[])
        };
    }

    /**
     * Get the dimensions of the parent element.
     * 
     * @returns the dimensions of the parent container, or null if operation failed
     */
    private getParentDimensions(): number[] | null {
        const dims = this.el.nativeElement.parentNode?.getBoundingClientRect();

        if (dims && dims.width && dims.height) {
            return [dims.width, dims.height];
        }

        return null;
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

    /**
     * A helper function for panning the graph based on a mouse movement.
     * 
     * @param {MouseEvent} event the mouse event to read panning information from.
     */
    private onPan(event: MouseEvent): void {
        // Check that pan is enabled
        if (!this.panEnabled()) {
            return;
        }

        // Pan with the appropriate axes enabled.
        switch (this.panningAxis()) {
            case 'horizontal':
                this.pan(event.movementX, 0);
                break;
            case 'vertical':
                this.pan(0, event.movementY);
                break;
            default:
                this.pan(event.movementX, event.movementY);
        }
    }

    /**
     * Pan the graph by a fixed x and y amount.
     * 
     * @param {number} x the x amount to pan by
     * @param {number} y the y amount to pan by
     * @param {boolean} ignoreZoomLevel whether to scale the panning by the zoom factor or no. Default is false.
     */
    private pan(x: number, y: number, ignoreZoomLevel: boolean = false): void {
        const zoomLevel = ignoreZoomLevel ? 1 : this.zoomLevel();
        this.transformationMatrix.set(transform(this.transformationMatrix(), translate(x / zoomLevel, y / zoomLevel)));
    }

    /**
     * Pan the graph so it is centered at a given position.
     * 
     * @param {number} x x coord to pan to.
     * @param {number} y y coord to pan to.
     */
    private panTo(x: number, y: number): void {
        // Ensure proper input
        if (isNaN(x) || isNaN(y)) {
            return;
        }

        const panX = -this.transformationMatrix().e - x * this.zoomLevel(); // todo add half dimension width/height here
        const panY = -this.transformationMatrix().f - y * this.zoomLevel();

        this.transformationMatrix.set(transform(
            this.transformationMatrix(),
            translate(panX / this.zoomLevel(), panY / this.zoomLevel())
        ));
    }

    /**
     * Pan to be centered on a node.
     * 
     * @param {string} id the id of the node to pan to.
     */
    private panToNodeId(id: string): void {
        const node = this.graph.nodes.find((node: Node) => node.id === id);
        if (!node || !node.position) {
            return;
        }

        this.panTo(node.position?.x, node.position?.y);
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

    /**
     * Zoom by a factor.
     * 
     * @param {number} factor the factor to zoom by
     */
    private zoom(factor: number): void {
        this.transformationMatrix.set(transform(this.transformationMatrix(), scale(factor, factor)));
    }

    /**
     * Zoom to a specific level.
     * 
     * @param {number} level the level to zoom to
     */
    private zoomTo(level: number): void {
        this.transformationMatrix.update((value) => {
            value.a = isNaN(level) ? value.a : Number(level);
            value.d = isNaN(level) ? value.d : Number(level);
            return value;
        });
    }

    /**
     * Zoom to center the graph in the view.
     */
    private zoomToFit(): void {

    }

    //#endregion Zoom Methods

    //#endregion Helper Methods
}
