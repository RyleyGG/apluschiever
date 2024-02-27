import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { SpeedDialModule } from 'primeng/speeddial';
import { MultiSelectModule } from 'primeng/multiselect';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MenuItem } from 'primeng/api';

import { FormsModule } from '@angular/forms';

import FuzzySearch from 'fuzzy-search';

import { GraphComponent } from '../../graph/graph.component';
import { Node, Edge, Cluster } from '../../graph/graph.interface';
import { CourseService } from '../../core/services/course/course.service';
import { InputTextModule } from 'primeng/inputtext';
import { filter } from 'd3';
import { uid } from '../../core/utils/unique-id';

/**
 * The course view page component
 * 
 * Right now it has a graph of dummy data being displayed.
 */
@Component({
    selector: 'course-view-page',
    standalone: true,
    imports: [CommonModule, GraphComponent, FormsModule, InputTextModule, MultiSelectModule, AutoCompleteModule, DialogModule, AvatarModule, ButtonModule, SidebarModule, TooltipModule, SpeedDialModule, InputSwitchModule],
    templateUrl: './course-view.page.component.html',
    styleUrl: './course-view.page.component.css'
})
export class CourseViewPageComponent {
    @ViewChild('graphComponent') graphComponent!: GraphComponent;
    selectedNode!: Node;

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

    suggestedNodes: any[] = [];

    showPreReqs: boolean = false;

    showComplete: boolean = true;

    chips: any[] = ["option1", "option2"];
    selectedChips: any;

    //#endregion


    nodes: Node[] = [];
    edges: Edge[] = [];
    clusters: Cluster[] = [];

    constructor(private courseService: CourseService) {
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
                    color: "var(--text-color)"
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

            this.highlightPreRequisites(this.nodes[18]);
        });
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
    }

    //#region Filtering & Searching Methods

    getNodeLabels(event: AutoCompleteCompleteEvent) {
        // Uses fuzzy searching to provide suggestions of what the user may be looking for
        const searcher = new FuzzySearch(this.nodes, ['label'], {
            caseSensitive: true,
        });
        this.suggestedNodes = Array.from(searcher.search(event.query));
    }

    //#endregion Filtering & Searching Methods


    //#region Node Highlighting

    highlightCompleted = (): void => {
        //this.nodes.forEach((node)  =>  {
        //    node.color = node.complete ? "var(--green-700)" : "var(--text-color)";
        //});

        //this.edges.forEach((edge) =>  {
        //    const source = this.nodes.find(node => node.id == edge.source);
        //    if (source == undefined)  { return; }
        //    edge.color = source.complete ? "var(--green-700)" : "var(--text-color)";
        //});
    }

    highlightPreRequisites = (selectedNode: Node): void => {
        const preReqs: string[] = this.getPreRequisites(selectedNode);
        this.setNodeColor(preReqs, "var(--yellow-500)");

        // Grab the edges connecting the pre-reqs and the selectedNode, then color them
        const filteredEdges = this.edges.filter(edge => preReqs.includes(edge.source) && (preReqs.includes(edge.target) || edge.target == selectedNode.id))
        this.setEdgeColor(filteredEdges.map(edge => edge.id!), "var(--yellow-500)");
    }

    //#endregion Node Highlighting

    //#region Helper Functions

    /**
     * Gets a list of all pre-requisites of a node (as an array of node ids).
     * 
     * @param sourceNode 
     * @returns 
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

    /**
     * Set color of all given nodes with matching IDs to the given color string.
     * 
     * @param {string[]} nodeIds list of IDs of nodes to update
     * @param {string} color the new color to use for all these nodes
     */
    setNodeColor = (nodeIds: string[], color: string): void => {
        const updatedNodes = this.nodes.map(node => {
            if (!node.id) { return node; }

            if (nodeIds.includes(node.id)) {
                return { ...node, color: color };
            }
            return node;
        });
        this.nodes = updatedNodes;
    }

    /**
     * Set color of all given edges with matching IDs to the given color string.
     * 
     * @param {string[]} edgeIds list of IDs of edges to update
     * @param {string} color the new color to use for all these edges
     */
    setEdgeColor = (edgeIds: string[], color: string): void => {
        console.log(edgeIds);
        const updatedEdges = this.edges.map(edge => {
            if (!edge.id) { return edge; }

            if (edgeIds.includes(edge.id)) {
                return { ...edge, color: color };
            }
            return edge;
        });
        this.edges = updatedEdges;
    }

    //#endregion Helper Functions


}