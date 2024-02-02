import { Component, ContentChild, ElementRef, HostListener, QueryList, TemplateRef, ViewChildren, computed, effect, input, signal, untracked, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node, Edge, Cluster, Graph, Layout } from './graph.interface';
import { identity, scale, smoothMatrix, toSVG, transform, translate } from 'transformation-matrix';
import { MouseWheelDirective } from '../core/directives/mouse-wheel.directive';
import { DagreClusterLayout } from './layouts/dagreCluster';
import { Observable, first, of } from 'rxjs';
import { uid } from '../core/utils/unique-id';


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
    imports: [CommonModule, MouseWheelDirective],
    templateUrl: './graph.component.html',
    styleUrl: './graph.component.css'
})
export class GraphComponent {
    // General Graph Inputs
    view = input<number[]>();
    nodes = input.required<Node[]>();
    edges = input.required<Edge[]>();
    clusters = input<Cluster[]>([]);

    layout = signal<string | Layout>(new DagreClusterLayout());
    layoutSettings = signal<any>(DagreClusterLayout.defaultSettings);

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
    zoomLevel = signal<number>(1);
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

    initialized: boolean = false;

    // Private Properties
    private transformationMatrix = signal<Matrix>(identity());
    public transform = computed(() => toSVG(smoothMatrix(this.transformationMatrix(), 100)));

    public graph!: Graph; // Initialized within the createGraph() method, which is called in constructor.

    public isDragging: boolean = false;
    public isPanning: boolean = false;

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
        // Setup the effect to reset the graph when layout or its settings change
        effect(() => {
            this.initialized = false;
            const layout = this.layout();
            const settings = this.layoutSettings();
            if (layout == 'dagreCluser') {
                // TODO: We should refactor this to work for more layout options. This is fine for now
                untracked(() => {
                    const newLayout = new DagreClusterLayout();
                    newLayout.settings = settings;
                    this.layout.set(newLayout);
                });
            }
            this.update();
        });

        // Setup the effect to reset the graph when the graph updates
        effect(() => {
            this.view();
            this.nodes();
            this.clusters();
            this.edges();

            this.update();
        });

        // Setup the effect for zoom functionality
        effect(() => {
            const level = this.zoomLevel();
            untracked(() => this.zoomTo(level));
        });

        // Setup the effect for pan offset functionality
        effect(() => {
            const offX = this.panOffsetX();
            const offY = this.panOffsetY();
            untracked(() => this.panTo(offX || 0, offY || 0));
        });

        // Setup the effect for pan to node functionality
        effect(() => {
            const nodeId = this.panToNode();
            if (!nodeId) { return; }
            untracked(() => this.panToNodeId(nodeId));
        });
    }

    ngOnInit(): void {
        this.createGraph();
        this.initialized = true;
        requestAnimationFrame(() => this.draw());
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

    //#region Graph Drawing Methods

    /**
     * Creates an initial graph (cleans up input data)
     */
    private createGraph(): void {
        const initNode = (n: Node): Node => {
            // Set default settings for the nodes here.
            if (!n.meta) {
                n.meta = {};
            }
            if (!n.id) {
                n.id = uid();
            }
            if (!n.dimension) {
                n.dimension = {
                    width: 30,
                    height: 30
                };
                n.meta.forceDimensions = false;
            } else {
                n.meta.forceDimensions = n.meta.forceDimensions === undefined ? true : n.meta.forceDimensions;
            }
            if (!n.position) {
                n.position = {
                    x: 0,
                    y: 0
                };
            };
            return n;
        }

        const initEdge = (e: Edge): Edge => {
            // Set default settings for the edges here.
            if (!e.id) {
                e.id = uid();
            }
            return e;
        };

        this.graph = {
            nodes: this.nodes().length > 0 ? [...this.nodes()].map(initNode) : ([] as Node[]),
            edges: this.edges().length > 0 ? [...this.edges()].map(initEdge) : ([] as Edge[]),
            clusters: this.clusters().length > 0 ? [...this.clusters()].map(initNode) : ([] as Cluster[])
        };
    }

    /**
     * Called whenever the 
     */
    private update(): void {
        // Recalculate dimensions??

        // Set line type??

        // Set colors??

        // Create Graph
        this.createGraph();
        this.initialized = true;
    }

    /**
     * Call whatever layout is in use to actually draw the graph.
     */
    private draw(): void {
        if (!this.layout || typeof this.layout === 'string') {
            return;
        }

        this.applyNodeDimensions();
        const result = (this.layout() as Layout).run(this.graph);
        const result$ = result instanceof Observable ? result : of(result);
        // In case of dynamic graph via observable, will need to subscribe here and update accordingly

        if (this.graph.nodes.length === 0 && this.graph.clusters?.length === 0) {
            return;
        }

        console.log("draw");
        result$.pipe(first()).subscribe(() => {
            this.applyNodeDimensions();
        });

    }

    /**
     * Sets the node dimensions so we can display them correctly
     */
    private applyNodeDimensions(): void {
        if (!this.nodeElements || !this.nodeElements.length) {
            return;
        }

        this.nodeElements.map((element: ElementRef<any>) => {
            const nativeElement = element.nativeElement;
            const node = this.graph.nodes.find(n => n.id === nativeElement.id);

            if (!node) { return; }

            // Get the workable dimensions
            let dims: any;
            try {
                dims = nativeElement.getBBox();
                if (!dims.width || !dims.height) { return; }
            } catch (error: any) {
                return; // Skip if element isn't displayed
            }

            // Calculate the height
            node.dimension!.height =
                node.dimension!.height && node.meta.forceDimensions ? node.dimension!.height : dims.height;

            // Calculate the width
            if (nativeElement.getElementsByTagName('text').length) {
                // Get max dimensions for text (biggest possible)
                let maxTextDims = nativeElement.getElementsByTagName('text')[0].getBBox();
                try {
                    for (const textElement of nativeElement.getElementsByTagName('text')) {
                        const currentBBox = textElement.getBBox();
                        // Use biggest width & biggest height seen
                        maxTextDims.width = (currentBBox.width > maxTextDims.width) ? currentBBox.width : maxTextDims.width;
                        maxTextDims.height = (currentBBox.height > maxTextDims.height) ? currentBBox.height : maxTextDims.height;
                    }
                } catch (ex) {
                    return; // Skip drawing if element is not displayed
                }

                node.dimension!.width =
                    node.dimension!.width && node.meta.forceDimensions ? node.dimension!.width : maxTextDims.width + 20;
            } else {
                node.dimension!.width =
                    node.dimension!.width && node.meta.forceDimensions ? node.dimension!.width : dims.width;
            }
            console.log(node);

            // Update the transforms
            const x = node.position!.x - node.dimension!.width / 2;
            const y = node.position!.y - node.dimension!.height / 2;
            node.transform = `translate(${x}, ${y})`;
        });
    }

    private tick(): void {
        // TODO: for dynamically updating graph layouts, we need this method to handle frame by frame calculations
    }

    //#endregion Graph Drawing Methods

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

        const panX = -this.transformationMatrix().e - x * this.zoomLevel() + this.width() / 2; // todo add half dimension width/height here
        const panY = -this.transformationMatrix().f - y * this.zoomLevel() + this.height() / 2;

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

    public onZoom($event: WheelEvent, direction: any): void {
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
            const svgGroup = svg.querySelector('g.graph');

            // Create a SVG point
            const point = svg.createSVGPoint();
            point.x = mouseX;
            point.y = mouseY;
            const svgPoint = point.matrixTransform(svgGroup.getScreenCTM().inverse());

            // Pan around SVG, zoom, then unpan
            this.pan(svgPoint.x, svgPoint.y, true);
            this.zoomLevel.update((value) => value * zoomFactor);
            this.pan(-svgPoint.x, -svgPoint.y, true);
        } else {
            this.zoomLevel.update((value) => value * zoomFactor);
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

    //#region Helpers For Angular Template

    public trackEdgeBy(index: number, edge: Edge): any {
        return edge.id;
    }

    public trackNodeBy(index: number, node: Node): any {
        return node.id;
    }

    //#endregion

    //#endregion Helper Methods
}
