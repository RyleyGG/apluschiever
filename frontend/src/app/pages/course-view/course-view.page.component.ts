import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraphComponent } from '../../graph/graph.component';
import { Node, Edge, Cluster } from '../../graph/graph.interface';


/**
 * The sign in page component
 * 
 * Right now it has a single button for signing in, and prints the SuccessfulUserAuth result to the console.
 */
@Component({
    selector: 'course-view-page',
    standalone: true,
    imports: [CommonModule, GraphComponent],
    templateUrl: './course-view.page.component.html',
    styleUrl: './course-view.page.component.css'
})
export class CourseViewPageComponent {

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



    constructor() {

    }

    /**
     * This function fires whenever a node (or cluster) is clicked.
     * 
     * @param node The node that was clicked in the graph component.
     */
    onNodeClick(node: Node) {
        console.log(node);
    }
}