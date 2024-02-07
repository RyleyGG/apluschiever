import { Component, ContentChild, ElementRef, EventEmitter, HostListener, Output, QueryList, TemplateRef, ViewChildren, ViewEncapsulation, computed, effect, input, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node, Edge, Cluster, Graph, Layout } from './graph.interface';
import { identity, scale, smoothMatrix, toSVG, transform, translate } from 'transformation-matrix';
import { MouseWheelDirective } from '../core/directives/mouse-wheel.directive';
import { DagreClusterLayout } from './layouts/dagreCluster';
import { Observable, first, of } from 'rxjs';
import { select } from 'd3-selection';
import * as shape from 'd3-shape';
import * as ease from 'd3-ease';
import 'd3-transition';
import { uid } from '../core/utils/unique-id';


/**
 * Interface for a matrix, used by GraphComponent internally to track pan/zoom information.
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
 * The graph component. Its implementation was inspired by https://github.com/lars-berger/graphy-ng and https://github.com/swimlane/ngx-graph, but 
 * has been updated to angular 17, the signal workflow, and to be a standalone component.
 */
@Component({
    selector: 'graph',
    standalone: true,
    imports: [CommonModule, MouseWheelDirective],
    templateUrl: './graph.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrl: './graph.component.css'
})
export class GraphComponent {
    // General Graph Inputs
    public view = input<number[]>();
    public nodes = input.required<Node[]>();
    public edges = input.required<Edge[]>();
    public clusters = input<Cluster[]>([]);

    public layout = signal<string | Layout>(new DagreClusterLayout());
    public layoutSettings = signal<any>(DagreClusterLayout.defaultSettings);
    public curve = signal<any>(shape.curveBundle.beta(1));

    // Animation Inputs
    public animateEnabled = input<boolean>(true);

    // Drag Node Graph Inputs
    public dragEnabled = input<boolean>(true);

    // Graph Panning Inputs
    public panEnabled = input<boolean>(true);
    public panOffsetX = input<number>();
    public panOffsetY = input<number>();
    public panningAxis = input<'horizontal' | 'vertical' | 'both'>('both'); // TODO: maybe make enum
    public panToNode = input<string>(); // Accepts Node ID

    // Graph Zoom Inputs
    public zoomEnabled = input<boolean>(true);
    public zoomSpeed = input<number>(0.1);
    public zoomLevel = signal<number>(1);
    public minZoomLevel = input<number>(0.1);
    public maxZoomLevel = input<number>(5);
    public panOnZoom = input<boolean>(true);

    // Graph Outputs
    @Output() zoomLevelUpdated = new EventEmitter<number>();    // Emits when the zoom level is changed. 
    @Output() nodeClicked = new EventEmitter<Node>();           // Emits when a node is clicked.
    @Output() clickHandler = new EventEmitter<MouseEvent>();    // Emits whenever the graph is clicked.

    // Public Properties & Computed Values

    /*
     * We try setting width/height first through the input view(),
     * if that fails then we try getting the size via the parent element,
     * if that fails, we fallback to a default value.
     */
    width = computed(() => Math.floor((this.view() || this.getParentDimensions() || [600, 400])[0]));
    height = computed(() => Math.floor((this.view() || this.getParentDimensions() || [600, 400])[1]));

    /**
     * Computed signal to automatically convert the transformation matrix storing pan/zoom information 
     * from a matrix to a string suitable for use on an SVG.
     */
    public readonly transform = computed(() => toSVG(smoothMatrix(this.transformationMatrix(), 100)));

    /**
     * Ensures the graph isn't displayed before it is ready. Must be made public 
     * in order to be used within the component template, but should ALMOST NEVER be modified outside of this component.
     */
    public initialized: boolean = false;

    /**
     * Allows the template to display the graph nodes & edges, and is used heavily within
     * the calculations done to calculate node positions. This should ALMOST NEVER be modified outside of this component.
     */
    public graph!: Graph; // Initialized within the createGraph() method, which is called in constructor.

    /**
     * Allows the template to turn on/off the dragging functionality for nodes.
     * Should ALMOST NEVER be modified outside of this component.
     */
    public isDragging: boolean = false;

    public draggedNode: any;
    /**
     * Allows the template to turn on/off the panning functionality when the panning rectangle is clicked on.
     * Should ALMOST NEVER be modified outside of this component.
     */
    public isPanning: boolean = false;

    // Private Properties
    /**
     * Stores the pan/zoom information.
     */
    private transformationMatrix = signal<Matrix>(identity());

    private centerNodesOnPositionChange: boolean = true;
    private _oldEdges: Edge[] = [];

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
        /**
         * I'm using 'untracked' in the below in order to be able to call functions/update the 
         * value of Angular signals within an 'effect' function (as that's typically problematic).
         * This hack probably isn't the best, but it isn't causing issues right now.
         */

        // Setup the effect to reset the graph when layout or its settings change
        effect(() => {
            this.initialized = false;
            const layout = this.layout();
            const settings = this.layoutSettings();
            if (layout == 'dagreCluser') {
                // TODO: We should refactor this to work for more layout options. This is fine for now.
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
            // Call these just to get Angular to call update() when dependencies change
            this.view();
            this.nodes();
            this.clusters();
            this.edges();
            this.curve();

            untracked(() => this.update());
        });

        // Setup the effect to automatically send an emit when zoom level changes
        effect(() => this.zoomLevelUpdated.emit(this.zoomLevel()));

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

    /**
     * Initialized the graph component and calls the first render for the component.
     */
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
        if (this.isPanning) {
            this.onPan($event);
        } else if (this.isDragging) {
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
        this.clickHandler.emit($event);
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
            n.meta ??= {};
            n.id ??= uid();
            if (!n.dimension) {
                n.dimension = {
                    width: 20,
                    height: 20
                };
                n.meta.forceDimensions = false;
            } else {
                n.meta.forceDimensions ??= true;
            }
            n.position ??= {
                x: 0,
                y: 0
            };
            n.color ??= '#000000';
            return n;
        }

        const initEdge = (e: Edge): Edge => {
            // Set default settings for the edges here.
            e.id ??= uid();
            e.color ??= '#000000';
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

        // Set line type
        if (!this.curve()) {
            this.curve.set(shape.curveBundle.beta(1));
        }

        // Set colors??


        // Create Graph
        this.createGraph();
        this.initialized = true;
    }

    /**
     * Call whatever layout is in use to actually draw the graph.
     */
    private draw(): void {
        if (!this.layout || typeof this.layout === 'string') { return; }

        // this.applyNodeDimensions();
        const result = (this.layout() as Layout).run(this.graph);
        const result$ = result instanceof Observable ? result : of(result);
        // Dynamic graph will tick many times, static will tick only once
        result$.subscribe((graph: Graph) => {
            this.graph = graph;
            this.tick();
        });

        if (this.graph.nodes.length === 0 && this.graph.clusters?.length === 0) { return; }

        result$.pipe(first()).subscribe(() => this.applyNodeDimensions());
    }

    /**
     * Sets the node dimensions so we can display them correctly
     */
    private applyNodeDimensions(): void {
        if (!this.nodeElements || !this.nodeElements.length) { return; }

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
        });
    }

    private tick(): void {
        // TODO: for dynamically updating graph layouts, we need this method to handle frame by frame calculations

        // Set view options for the nodes & clusters
        this.graph.nodes.map((n: Node) => {
            n.transform = `translate(${n.position!.x - (this.centerNodesOnPositionChange ? n.dimension!.width / 2 : 0) || 0}, ${n.position!.y - (this.centerNodesOnPositionChange ? n.dimension!.height / 2 : 0) || 0})`;
            n.data ??= {};
            n.color ??= '#000000';
        });

        (this.graph.clusters || []).map((c: Cluster) => {
            c.transform = `translate(${c.position!.x - (this.centerNodesOnPositionChange ? c.dimension!.width / 2 : 0) || 0}, ${c.position!.y - (this.centerNodesOnPositionChange ? c.dimension!.height / 2 : 0) || 0})`;
            c.data ??= {};
            c.color ??= '#000000';
        });

        // Prevent animations for the new nodes

        // Update edges
        const newEdges: Edge[] = [];
        for (const edgeLabelId in this.graph.edgeLabels) {
            const edgeLabel = this.graph.edgeLabels[edgeLabelId];

            const normKey = edgeLabelId.replace(/[^\w-]*/g, '');

            // Determine if multigraph or not (need to get layout separate for TypeScript checker)
            const layout = this.layout();
            const isMultigraph = typeof layout !== 'string' && layout.settings && layout.settings.multigraph;

            let oldEdge = isMultigraph
                ? this._oldEdges.find((old: Edge) => `${old.source}${old.target}${old.id}` === normKey)
                : this._oldEdges.find((old: Edge) => `${old.source}${old.target}` === normKey);

            const graphEdge = isMultigraph
                ? this.graph.edges.find((e: Edge) => `${e.source}${e.target}${e.id}` === normKey)
                : this.graph.edges.find((e: Edge) => `${e.source}${e.target}` === normKey);

            // compare old edge to new edge and update if not same

            if (!oldEdge) {
                oldEdge = graphEdge || edgeLabel;
            } else if (
                oldEdge.data &&
                graphEdge &&
                graphEdge.data &&
                JSON.stringify(oldEdge.data) !== JSON.stringify(graphEdge.data)
            ) {
                oldEdge.data = graphEdge.data;
            }

            // Set the new line, keep track of previous one for some animations.
            oldEdge!.oldLine = oldEdge!.line;
            const points = edgeLabel.points;
            const line = this.generateLine(points);

            const newEdge = Object.assign({}, oldEdge);
            newEdge.line = line;
            newEdge.points = points;

            this.updateMidpointOnEdge(newEdge, points);

            const textPos = points[Math.floor(points.length / 2)];
            if (textPos) {
                newEdge.textTransform = `translate(${textPos.x || 0},${textPos.y || 0})`;
            }

            newEdge.textAngle = 0;
            newEdge.oldLine ??= newEdge.line;

            this.setDominantBaseline(newEdge);
            newEdges.push(newEdge);
        }
        this.graph.edges = newEdges;

        // Setup links for animations
        if (this.graph.edges) {
            this._oldEdges = this.graph.edges.map(l => {
                const newL = Object.assign({}, l);
                newL.oldLine = l.line;
                return newL;
            });
        }

        // TODO: Check for auto zoom and auto center


        requestAnimationFrame(() => this.redrawLines());
    }

    /**
     * Updates the lines of the graph
     * 
     * @param _animate whether to animate the transition to new lines or not. 
     */
    private redrawLines(_animate: boolean = this.animateEnabled()): void {
        this.edgeElements.map((element: ElementRef<any>) => {
            const edge = this.graph.edges.find((e: Edge) => e.id == element.nativeElement.id);
            if (!edge) { return; }

            select(element.nativeElement).select('.line')
                .attr('d', edge.oldLine)
                .transition()
                .ease(ease.easeSinInOut)
                .duration(_animate ? 500 : 0)
                .attr('d', edge.line);


            select(element.nativeElement).select(`#${edge.id}`)
                .attr('d', edge.oldTextPath as any)
                .transition()
                .ease(ease.easeSinInOut)
                .duration(_animate ? 500 : 0)
                .attr('d', edge.textPath);

            this.updateMidpointOnEdge(edge, edge.points);
        });
    }

    //#endregion Graph Drawing Methods

    //#region Drag Node Methods

    private onDrag(event: MouseEvent): void {
        // Check that drag is enabled
        if (!this.dragEnabled()) { return; }


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
        if (!this.panEnabled()) { return; }

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
        if (isNaN(x) || isNaN(y)) { return; }

        const panX = -this.transformationMatrix().e - x * this.zoomLevel() + this.width() / 2;
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
        if (!node || !node.position) { return; }

        this.panTo(node.position?.x, node.position?.y);
    }

    //#endregion Pan Methods

    //#region Zoom Methods

    /**
     * 
     * @param $event 
     * @param direction 
     * @returns 
     */
    public onZoom($event: WheelEvent, direction: any): void {
        // Check that zoom is enabled
        if (!this.zoomEnabled()) { return; }

        const zoomFactor = 1 + (direction === 'in' ? this.zoomSpeed() : -this.zoomSpeed());

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
    private zoom = (factor: number): void => {
        const tempMatrix = transform(this.transformationMatrix(), scale(factor, factor));

        // Constrain to max and min zoom levels.
        if (tempMatrix.a >= this.maxZoomLevel()) { this.zoomTo(this.maxZoomLevel()); }
        else if (tempMatrix.a <= this.minZoomLevel()) { this.zoomTo(this.minZoomLevel()); }
        else { this.transformationMatrix.update((value) => tempMatrix); }

        this.zoomLevel.set(this.transformationMatrix().a);
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

    public trackEdgeBy = (index: number, edge: Edge): any => edge.id;

    public trackNodeBy = (index: number, node: Node): any => node.id;

    /**
     * Triggers when a node is clicked.
     * 
     * @param event the mouse event which triggered this function call.
     * @param node the node that was clicked.
     */
    public onNodeClick = (event: MouseEvent, node: Node): any => {
        console.log(event);
        console.log(node);
        this.nodeClicked.emit(node);
    }

    /**
     * Triggers when the mouse goes down over a node.
     * @param event 
     * @param node 
     * @returns 
     */
    public onNodeMouseDown = (event: MouseEvent, node: Node): any => {
        if (!this.dragEnabled()) { return; }
        this.isDragging = true;
        this.draggedNode = event;

        const layout = this.layout();
        if (typeof layout !== 'string' && layout.onDragStart) {
            layout.onDragStart(node, event);
        }
    }

    //#endregion

    //#region Miscellaneous Helpers

    /**
     * A helper function to generate the correct d3 line shape when given a set of points.
     * 
     * @param {any} points the points to generate the line for 
     * @returns 
     */
    private generateLine = (points: any) => (shape.line<any>().x((d) => d.x).y((d) => d.y).curve(this.curve()))(points);


    /**
     * Update an edges midpoint based on the given points.
     * 
     * @param edge 
     * @param points 
     * @returns 
     */
    private updateMidpointOnEdge(edge: Edge, points: any) {
        if (!edge || !points) { return; }

        if (points.length % 2 === 1) {
            edge.midPoint = points[Math.floor(points.length / 2)];
        } else {
            const _first = points[points.length / 2];
            const _second = points[points.length / 2 - 1];
            edge.midPoint = {
                x: (_first.x + _second.x) / 2,
                y: (_first.y + _second.y) / 2
            };
        }
    }

    /**
     * Helps calculate where text should be placed on an edge. 
     * 
     * @param {Edge} edge the edge to set the baseline for. 
     */
    private setDominantBaseline(edge: Edge) {
        const firstPoint = edge.points[0];
        const lastPoint = edge.points[edge.points.length - 1];
        edge.oldTextPath = edge.textPath;

        if (lastPoint.x < firstPoint.x) {
            edge.dominantBaseline = 'text-before-edge';
            // reverse text path for when its flipped upside down
            edge.textPath = this.generateLine([...edge.points].reverse());
        } else {
            edge.dominantBaseline = 'text-after-edge';
            edge.textPath = edge.line;
        }
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

    //#endregion Miscellaneous Helpers

    //#endregion Helper Methods
}
