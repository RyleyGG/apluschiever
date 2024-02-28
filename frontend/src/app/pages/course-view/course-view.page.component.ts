import { Component, ViewChild, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';

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


    nodes: Node[] = [];
    edges: Edge[] = [];
    clusters: Cluster[] = [];

    courseid: string | any;
    constructor(private courseService: CourseService, private route : ActivatedRoute) {
        this.courseid = this.route.snapshot.paramMap.get('id');
        //this.courseid = this.route.snapshot.paramMap.get('ID');
        // On page load get the course information (id)
        // will need to be a URL parameter probably
        // TODO: Get the Course ID from another source (maybe route param, maybe a service?)
        this.courseService.getNodes(this.courseid).subscribe((data) => {
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
                        source: parent.id,
                        target: element.id,
                        color: "var(--text-color)"
                    });
                });
                this.edges = [...this.edges, ...newEdges];
            });
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
}