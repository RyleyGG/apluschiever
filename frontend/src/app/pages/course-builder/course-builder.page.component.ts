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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CardModule } from 'primeng/card';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { GraphComponent } from '../../graph/graph.component';
import { Node, Edge, Cluster } from '../../graph/graph.interface';
import { CourseService } from '../../core/services/course/course.service';
import { InputTextModule } from 'primeng/inputtext';

import { PanelModule } from 'primeng/panel';
import { DagreSettings, Orientation } from '../../graph/layouts/dagreCluster';

/**
 * The course view page component
 * 
 * Right now it has a graph of dummy data being displayed.
 */
@Component({
    selector: 'course-build-page',
    standalone: true,
    imports: [CommonModule, GraphComponent, CardModule, SelectButtonModule, ToggleButtonModule, ContextMenuModule, TagModule, FormsModule, PanelModule, BlockUIModule, ColorPickerModule, InputTextModule, MultiSelectModule, AutoCompleteModule, DialogModule, AvatarModule, ButtonModule, SidebarModule, TooltipModule, SpeedDialModule, InputSwitchModule],
    templateUrl: './course-builder.page.component.html',
    styleUrl: './course-builder.page.component.css'
})
export class CourseBuilderPageComponent {
    @ViewChild('graphComponent') graphComponent!: GraphComponent;
    selectedNode!: Node; // the node that is in the node dialog popup

    /**
     * Graph rendering settings in use
     */
    courseViewGraphSettings: DagreSettings = {
        orientation: Orientation.LEFT_TO_RIGHT,
        marginX: 20,
        marginY: 20,
        edgePadding: 100,
        rankPadding: 200,
        nodePadding: 50,
        multigraph: true,
        compound: true
    };

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
                tooltipLabel: 'Add Filters',
                tooltipPosition: "bottom"
            },
            icon: 'pi pi-filter-fill',
            iconStyle: { margin: 0 },
            command: () => { this.sidebarVisible = true; }
        },
        {
            tooltipOptions: {
                tooltipLabel: 'Zoom to Fit',
                tooltipPosition: "bottom"
            },
            icon: 'pi pi-money-bill',
            iconStyle: { margin: 0 },
            command: () => {
                this.graphComponent.zoomToFit();
                this.graphComponent.panToCenter();
            }
        },
        {
            tooltipOptions: {
                tooltipLabel: 'Zoom to Fit',
                tooltipPosition: "bottom"
            },
            icon: 'pi pi-money-bill',
            iconStyle: { margin: 0 },
            command: () => {
                this.graphComponent.zoomToFit();
                this.graphComponent.panToCenter();
            }
        },
        {
            tooltipOptions: {
                tooltipLabel: 'Zoom to Fit',
                tooltipPosition: "bottom"
            },
            icon: 'pi pi-money-bill',
            iconStyle: { margin: 0 },
            command: () => {
                this.graphComponent.zoomToFit();
                this.graphComponent.panToCenter();
            }
        },
        {
            tooltipOptions: {
                tooltipLabel: 'Zoom to Fit',
                tooltipPosition: "bottom"
            },
            icon: 'pi pi-money-bill',
            iconStyle: { margin: 0 },
            command: () => {
                this.graphComponent.zoomToFit();
                this.graphComponent.panToCenter();
            }
        }
    ];
    value: any;
    checked: any = false;

    // TODO: add command for each item.
    contextMenuItems: MenuItem[] = [
        { label: 'Add Lesson Node', icon: 'pi pi-fw pi-book' },
        { label: 'Add Connection', icon: 'pi pi-fw pi-arrows-h' },
        { label: 'Menu Item 3', icon: 'pi pi-fw pi-trash' }
    ];


    nodes: Node[] = [];
    edges: Edge[] = [];
    clusters: Cluster[] = [];

    constructor(private courseService: CourseService, private elementRef: ElementRef) { }


    /**
     * This function fires whenever a node (or cluster) is clicked.
     * It updates the selected node, pans to that node and opens the dialog component.
     * 
     * @param node The node that was clicked in the graph component.
     */
    onNodeClick(node: Node) {
        this.selectedNode = node;
        this.graphComponent.panToNodeId(node.id);
        this.dialogVisible = true;
    }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
    }


    //#region Node Highlighting

    /**
     * Highlight all the pre-requisites of a given node with the given color.
     * 
     * @param selectedNode 
     * @param color
     */
    highlightPreRequisites = (selectedNode: Node, color: string): void => {
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