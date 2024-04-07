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
import { CardModule } from 'primeng/card';
import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { GraphComponent } from '../../graph/graph.component';
import { BlockableDiv } from '../../core/components/blockable-div/blockable-div.component';
import { Node, Edge, Cluster } from '../../graph/graph.interface';
import { CourseService } from '../../core/services/course/course.service';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { uid } from '../../core/utils/unique-id';

import { PanelModule } from 'primeng/panel';
import { DagreSettings, Orientation } from '../../graph/layouts/dagreCluster';

/**
 * The course view page component
 * 
 * Right now it has a graph of dummy data being displayed.
 */
@Component({
  selector: 'course-view-page',
  standalone: true,
  imports: [CommonModule, GraphComponent, CardModule, BlockableDiv, DividerModule, TagModule, FormsModule, PanelModule, BlockUIModule, ColorPickerModule, InputTextModule, MultiSelectModule, AutoCompleteModule, DialogModule, AvatarModule, ButtonModule, SidebarModule, TooltipModule, SpeedDialModule, InputSwitchModule],
  templateUrl: './course-view.page.component.html',
  styleUrl: './course-view.page.component.css'
})
export class CourseViewPageComponent {
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

  //#region Filtering & Searching Properties

  searchResults: Node[] = []; // array of node ids for matched nodes

  selectedNodes: Node[] = [];

  tags: any[] = ["chip"];
  selectedTags: any[] = [];

  contentTypes: any[] = ["video", "text", "quiz"];
  selectedContentTypes: any[] = [];

  // view options
  showPreReqs: boolean = true;
  showComplete: boolean = true;

  selectedColor: any;
  searchColor: any;
  completeColor: any;
  preReqColor: any;

  // booleans for checkboxes
  selectAllNodes: boolean = false;
  selectAllTags: boolean = false;
  selectAllContentTypes: boolean = false;

  //#endregion


  nodes: Node[] = [];
  edges: Edge[] = [];
  clusters: Cluster[] = [];

  courseid: string | any;
  public courseName: string = "";

  constructor(private courseService: CourseService, private elementRef: ElementRef, private route: ActivatedRoute) {
    this.courseid = this.route.snapshot.paramMap.get('id');

    this.courseService.getNodes(this.courseid).subscribe((data) => {
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
            short_description: element.short_description,
            complete: element.complete,
            tags: [...element.tags],
            content_types: [...element.content_types]
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

      // Grab all unique tags
      this.tags = Array.from(new Set<string>(this.nodes.flatMap((node: any) => node.data.tags)));

      // Grab all unique content types
      this.contentTypes = Array.from(new Set<string>(this.nodes.flatMap((node: any) => node.data.content_types)));

      this.updateHighlights();

      // For some reason this needs to be 1 millisecond delayed at minimum for the zoom and center to apply. Probably for the CSS to update/apply
      setTimeout(() => {
        this.graphComponent.zoomToFit();
        this.graphComponent.panToCenter();
      }, 1);
    });

    /**
     * Theres probably a more effecient way to get the course name, 
     * but this will do for now...
     */
    this.courseService.getCourses().subscribe((data: any[]) => {
      for (let course of data) {
        if (course.id === this.courseid) {
          this.courseName = course.title;
        }
      }
    })
  }

  // Set default colors as primeNG ones (todo: have this set in local storage)
  ngOnInit() {
    this.completeColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue("--green-700");
    this.preReqColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue("--yellow-700");
    this.searchColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue("--indigo-700");
    this.selectedColor = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue("--purple-700");
  }




  /**
   * This function fires whenever a node (or cluster) is clicked.
   * It updates the selected node, pans to that node and opens the dialog component.
   * 
   * @param node The node that was clicked in the graph component.
   */
  onNodeClick(node: Node) {
    this.selectedNode = node;
    this.graphComponent.panToNodeId(node.id!);
    this.dialogVisible = true;

    this.updateSelectedNodes();
    this.updateHighlights();
  }


  //#region Filtering & Searching Methods

  onSelectAllNodesChange = ($event: any): void => {
    this.selectAllNodes = $event.checked;
    this.selectedNodes = $event.checked ? [...this.nodes] : [];
    this.updateSelectedNodes();
    this.updateHighlights();
  }

  onSelectAllTagsChange = ($event: any): void => {
    this.selectAllTags = $event.checked;
    this.selectedTags = $event.checked ? [...this.tags] : [];
    this.updateSelectedNodes();
    this.updateHighlights();
  }

  onSelectAllContentTypesChange = ($event: any): void => {
    this.selectAllContentTypes = $event.checked;
    this.selectedContentTypes = $event.checked ? [...this.contentTypes] : [];
    this.updateSelectedNodes();
    this.updateHighlights();
  }

  /**
   * Update the search result nodes based on the filter statuses
   */
  updateSelectedNodes = (): void => {
    // get the search results of the name
    const nameResults = this.nodes
      .filter((node) => this.selectedNodes.findIndex(selectedNode => selectedNode.id === node.id) !== -1);

    // then add on searches by tags
    const tagResults = this.nodes
      .filter((node) => this.selectedTags.some((tag: any) => node.data.tags.includes(tag)));

    // then add on searches by content types
    const contentTypeResults = this.nodes
      .filter((node) => this.selectedContentTypes.some((contentType: any) => node.data.content_types.includes(contentType)));

    // take the results of the above into one big array (this.searchResults) and remove all duplicates
    this.searchResults = [...new Set([...nameResults, ...tagResults, ...contentTypeResults])];
  }

  //#endregion Filtering & Searching Methods


  //#region Node Highlighting

  /**
   * Updates all highlighting for the graph based on parameters
   */
  updateHighlights = (): void => {
    this.setNodeColor(this.nodes.map(node => node.id!), "var(--text-color)");
    this.setEdgeColor(this.edges.map(edge => edge.id!), "var(--text-color)");

    this.highlightPreRequisites(this.selectedNode, this.preReqColor);
    this.highlightCompleted(this.completeColor);
    this.highlightSearched(this.searchColor);
    this.setNodeColor([this.selectedNode.id!], this.selectedColor);
  }

  /**
   * Highlights the searched nodes to a given color.
   * 
   * @param color 
   */
  highlightSearched = (color: string): void => this.setNodeColor(this.searchResults.map((node) => node.id!), color);

  /**
   * Highlight all the completed nodes with the given color.
   * 
   * @param color 
   */
  highlightCompleted = (color: string): void => {
    if (!this.showComplete) { return; }
    // Use filters and maps to get completed node and edge ids
    const completedNodes = this.nodes.filter((node) => node.data.complete == true).map((node) => node.id!);
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
    return this.nodes.filter((node) => preReqs.includes(node.id!) && !node.data.complete).length == 0;
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
    const nodesToCheck: Set<string> = new Set([sourceNode.id!]);
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
   * Zooms and fits the graph component to the screen.
   */
  zoomGraphToFit = (): void => {
    this.graphComponent.zoomToFit();
    this.graphComponent.panToCenter();
  }

  //#endregion Helper Functions

}