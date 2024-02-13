import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';

import { GraphComponent } from '../../graph/graph.component';
import { Node, Edge, Cluster } from '../../graph/graph.interface';
import { CourseService } from '../../core/services/course/course.service';
import { uid } from '../../core/utils/unique-id';


/**
 * The course view page component
 * 
 * Right now it has a graph of dummy data being displayed.
 */
@Component({
    selector: 'course-view-page',
    standalone: true,
    imports: [CommonModule, GraphComponent, DialogModule, AvatarModule, ButtonModule, SidebarModule, TooltipModule, SpeedDialModule],
    templateUrl: './course-view.page.component.html',
    styleUrl: './course-view.page.component.css'
})
export class CourseViewPageComponent {

    @ViewChild('graphComponent') graphComponent!: GraphComponent;
    selectedNode!: Node;

    // Variables to control visibility of side panel and dialog
    dialogVisible: boolean = false;
    sidebarVisible: boolean = false;

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

    // TODO: Once we have the backend setup for this, we will query for nodes/clusters and calculate the graph edges.

    nodes: Node[] = [
        {
            id: '1',
            label: 'Node A',
            color: '#FF0000'
        },
        {
            id: '2',
            label: 'Node B',
            color: '#00FFFF'
        },
        {
            id: '3',
            label: 'Node C',
            color: '#00F900'
        },
        {
            id: '4',
            label: 'Node D'
        },
        {
            id: '5',
            label: 'Node E'
        }
    ];

    edges: Edge[] = [
        {
            id: 'a',
            source: '1',
            target: '2',
            color: '#FF0000'
        }, {
            id: 'b',
            source: '1',
            target: '3'
        }, {
            id: 'c',
            source: '3',
            target: '4'
        }, {
            id: 'd',
            source: '3',
            target: '5'
        }, {
            id: 'e',
            source: '4',
            target: '5'
        },
        {
            id: 'f',
            source: '2',
            target: '1'
        },
        {
            id: 'g',
            source: '2',
            target: '5'
        }
    ];

    clusters: Cluster[] = [
        {
            id: 'cluster0',
            label: 'Background',
            color: '#00FFFF55',
            childNodeIds: ['1', '2', '3']
        }
    ];

    constructor(private courseService: CourseService) {
        // on page load get the course information
        // will need to be a URL parameter probably
        courseService.getNodes("").subscribe((data) => {
            this.nodes = [];
            this.edges = [];
            this.clusters = [];

            // Pass to create the nodes
            data.forEach((element: any) => {
                const newNode = {
                    id: element.id,
                    label: element.label
                }
                this.nodes = [...this.nodes, newNode];
            });

            // Pass to create the edges
            data.forEach((element: any) => {
                const newEdges: Edge[] = [];
                element.parentIds.forEach((id: string) => {
                    newEdges.push({
                        source: id,
                        target: element.id
                    });
                });
                this.edges = [...this.edges, ...newEdges];
            });
        });

        setTimeout(() => {
            this.nodes = [...this.nodes, { id: '6', label: 'Node F' }];
        }, 5000);

        setTimeout(() => {
            this.edges = [...this.edges, {
                id: 'h',
                source: '5',
                target: '6',
                color: '#FF00FF'
            }];
        }, 7000);
    }

    /**
     * This function fires whenever a node (or cluster) is clicked.
     * It updates the selected node and opens the dialog component.
     * 
     * @param node The node that was clicked in the graph component.
     */
    onNodeClick(node: Node) {
        this.selectedNode = node;
        this.dialogVisible = true;
    }


}