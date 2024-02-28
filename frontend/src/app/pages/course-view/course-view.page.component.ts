import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { SpeedDialModule } from 'primeng/speeddial';
import { MultiSelectModule } from 'primeng/multiselect';
import { ColorPickerModule } from 'primeng/colorpicker';
import { BlockUIModule } from 'primeng/blockui';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MenuItem } from 'primeng/api';

import { FormsModule } from '@angular/forms';

import FuzzySearch from 'fuzzy-search';

import { GraphComponent } from '../../graph/graph.component';
import { BlockableDiv } from '../../core/components/blockable-div/blockable-div.component';
import { Node, Edge, Cluster } from '../../graph/graph.interface';
import { CourseService } from '../../core/services/course/course.service';
import { InputTextModule } from 'primeng/inputtext';
import { uid } from '../../core/utils/unique-id';

import { PanelModule } from 'primeng/panel';

/**
 * The course view page component
 * 
 * Right now it has a graph of dummy data being displayed.
 */
@Component({
    selector: 'course-view-page',
    standalone: true,
    imports: [CommonModule, GraphComponent, BlockableDiv, FormsModule, PanelModule, BlockUIModule, ColorPickerModule, InputTextModule, MultiSelectModule, AutoCompleteModule, DialogModule, AvatarModule, ButtonModule, SidebarModule, TooltipModule, SpeedDialModule, InputSwitchModule],
    templateUrl: './course-view.page.component.html',
    styleUrl: './course-view.page.component.css'
})
export class CourseViewPageComponent {
    @ViewChild('graphComponent') graphComponent!: GraphComponent;
    selectedNode!: Node; // the node that is in the node dialog popup

    /**
     * Controls visibility of the node information dialog
     */
    dialogVisible: boolean = false;

    /**
     * Controls visibility of the filter options sidebar 
     */
    sidebarVisible: boolean = false;

    /**
     * Menu options for the '+' button 
     */
    dial_items: MenuItem[] = [
        {
            tooltipOptions: {
                tooltipLabel: 'Add Filters'
            },
            icon: 'pi pi-filter-fill',
            command: () => { this.sidebarVisible = true; }
        },
        {
            tooltipOptions: {
                tooltipLabel: 'Zoom to Fit'
            },
            icon: 'pi pi-money-bill',
            command: () => {
                this.graphComponent.zoomToFit();
                this.graphComponent.panToCenter();
            }
        }
    ];

    //#region Filtering & Searching Properties

    selectedNodes: Node[] = [];
    selectAll: boolean = false;

    suggestedNodes: any[] = [];

    showPreReqs: boolean = true;
    showComplete: boolean = true;

    chips: any[] = ["chip"];
    selectedChips: any;

    contentTypes: any[] = ["video", "text", "quiz"];
    selectedContentTypes: any;

    searchColor: any;
    completeColor: any;
    preReqColor: any;

    //#endregion


    nodes: Node[] = [];
    edges: Edge[] = [];
    clusters: Cluster[] = [];

    constructor(private courseService: CourseService, private elementRef: ElementRef) {
        // On page load get the course information (id)
        // will need to be a URL parameter probably
        // TODO: Get the Course ID from another source (maybe route param, maybe a service?)
        this.courseService.getNodes("70a04a98-3ae8-4507-93a0-10ce5e51a61f").subscribe((data) => {
            this.nodes = [];
            this.edges = [];
            this.clusters = [];

            // Pass to create the nodes
            data.forEach((element: any) => {
                const newNode = {
                    id: element.id,
                    label: element.title,
                    color: "var(--text-color)",
                    data: {
                        complete: element.complete
                    }
                }
                this.nodes = [...this.nodes, newNode];
            });

            // Pass to create the edges
            data.forEach((element: any) => {
                const newEdges: Edge[] = [];
                element.parent_nodes.forEach((parent: any) => {
                    newEdges.push({
                        id: uid(),
                        source: parent.id,
                        target: element.id,
                        color: "var(--text-color)"
                    });
                });
                this.edges = [...this.edges, ...newEdges];
            });
            this.updateHighlights();
        });
    }

    // Set default colors as primeNG ones (todo: have this set in local storage)
    ngOnInit() {
        this.completeColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue("--green-700");
        this.preReqColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue("--yellow-700");
        this.searchColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue("--indigo-700");
    }

    /**
     * This function fires whenever a node (or cluster) is clicked.
     * It updates the selected node, pans to that node and opens the dialog component.
     * 
     * @param node The node that was clicked in the graph component.
     */
    onNodeClick(node: Node) {
        this.selectedNode = node;
        this.dialogVisible = true;
        this.graphComponent.panToNodeId(node.id);
        this.updateHighlights();
    }

    //#region Filtering & Searching Methods

    getNodeLabels = (event: AutoCompleteCompleteEvent) => {
        // Uses fuzzy searching to provide suggestions of what the user may be looking for
        const searcher = new FuzzySearch(this.nodes, ['label'], { caseSensitive: true });
        this.suggestedNodes = Array.from(searcher.search(event.query));
    }

    //#endregion Filtering & Searching Methods


    //#region Node Highlighting

    /**
     * Updates all highlighting for the graph based on parameters
     */
    updateHighlights = (): void => {
        console.log(this.selectedNodes);
        this.setNodeColor(this.nodes.map(node => node.id), "var(--text-color)");
        this.setEdgeColor(this.edges.map(edge => edge.id!), "var(--text-color)");

        this.highlightPreRequisites(this.selectedNode, this.preReqColor);
        this.highlightCompleted(this.completeColor);
        this.highlightSearched(this.searchColor);
    }

    highlightSearched = (color: string): void => this.setNodeColor(this.selectedNodes.map((node) => node.id), color);


    /**
     * Highlight all the completed nodes with the given color.
     * 
     * @param color 
     */
    highlightCompleted = (color: string): void => {
        if (!this.showComplete) { return; }
        // Use filters and maps to get completed node and edge ids
        const completedNodes = this.nodes.filter((node) => node.data.complete == true).map((node) => node.id);
        const completedEdges = this.edges.filter((edge) => completedNodes.includes(edge.source)).map((edge) => edge.id!);

        this.setNodeColor(completedNodes, color);
        this.setEdgeColor(completedEdges, color);
    }

    /**
     * Highlight all the pre-requisites of a given node with the given color.
     * 
     * @param selectedNode 
     * @param color
     */
    highlightPreRequisites = (selectedNode: Node, color: string): void => {
        if (!this.showPreReqs) { return; }
        if (!selectedNode) { return; }
        const preReqs: string[] = this.getPreRequisites(selectedNode);
        this.setNodeColor(preReqs, color);

        // Grab the edges connecting the pre-reqs and the selectedNode, then color them
        const filteredEdges = this.edges.filter(edge => preReqs.includes(edge.source) && (preReqs.includes(edge.target) || edge.target == selectedNode.id))
        this.setEdgeColor(filteredEdges.map(edge => edge.id!), color);
    }

    /**
     * Set color of all given nodes with matching IDs to the given color string.
     * 
     * @param {string[]} nodeIds list of IDs of nodes to update
     * @param {string} color the new color to use for all these nodes
     */
    setNodeColor = (nodeIds: string[], color: string): void => {
        this.nodes = this.nodes.map(node => {
            if (!node.id) { return node; }

            if (nodeIds.includes(node.id)) {
                return { ...node, color: color };
            }
            return node;
        });
    }

    /**
     * Set color of all given edges with matching IDs to the given color string.
     * 
     * @param {string[]} edgeIds list of IDs of edges to update
     * @param {string} color the new color to use for all these edges
     */
    setEdgeColor = (edgeIds: string[], color: string): void => {
        this.edges = this.edges.map(edge => {
            if (!edge.id) { return edge; }

            if (edgeIds.includes(edge.id)) {
                return { ...edge, color: color };
            }
            return edge;
        });
    }

    //#endregion Node Highlighting

    //#region Helper Functions

    /**
     * Determine if the pre-requisites for a node are satisfied or not.
     * 
     * @param sourceNode 
     * @returns 
     */
    preRequisitesSatisfied = (sourceNode: Node): boolean => {
        const preReqs: string[] = this.getPreRequisites(sourceNode);
        // Filter for all pre-req nodes that are not complete, if we get exactly 0 then we are satisfied.
        return this.nodes.filter((node) => preReqs.includes(node.id) && !node.data.complete).length == 0;
    }

    /**
     * Gets a list of all pre-requisites of a node (as an array of node ids).
     * 
     * @param sourceNode 
     * @returns the node ids for the pre-requisites of the node.
     */
    getPreRequisites = (sourceNode: Node): string[] => {
        // Does BFS in reverse in order to get all nodes before the source node. 
        const preReqs: string[] = [];
        const nodesToCheck: Set<string> = new Set([sourceNode.id]);
        const checkedNodes: Set<string> = new Set();

        while (nodesToCheck.size > 0) {
            const currentNodeId = nodesToCheck.values().next().value; // Get the first value in the set
            nodesToCheck.delete(currentNodeId); // Remove the node from the set
            checkedNodes.add(currentNodeId); // Mark the node as visited

            const edgesToCheck = this.edges.filter((edge) => edge.target === currentNodeId);
            for (let i = 0; i < edgesToCheck.length; i++) {
                const sourceNodeId = edgesToCheck[i].source;
                if (!checkedNodes.has(sourceNodeId) && !nodesToCheck.has(sourceNodeId)) {
                    nodesToCheck.add(sourceNodeId);
                    preReqs.push(sourceNodeId);
                }
            }
        }

        return preReqs;
    }

    //#endregion Helper Functions

}