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
import { DividerModule } from 'primeng/divider';
import { ContextMenuModule } from 'primeng/contextmenu';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CardModule } from 'primeng/card';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ChipsModule } from 'primeng/chips';
import { FileUploadModule } from 'primeng/fileupload';
import { EditorModule } from 'primeng/editor';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { GraphComponent } from '../../graph/graph.component';
import { Node, Edge, Cluster } from '../../graph/graph.interface';
import { CourseService } from '../../core/services/course/course.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { PanelModule } from 'primeng/panel';
import { DagreSettings, Orientation } from '../../graph/layouts/dagreCluster';
import { uid } from '../../core/utils/unique-id';
import { HistoryService } from '../../core/services/history/history.service';
import { Course, CourseFilters } from "../../core/models/course.interface";
import { User } from "../../core/models/user.interface";
import { UserService } from "../../core/services/user/user.service";
import { Message } from 'primeng/api';

/**
 * The course view page component
 *
 * Right now it has a graph of dummy data being displayed.
 */
@Component({
  selector: 'course-build-page',
  standalone: true,
  imports: [CommonModule, GraphComponent, MessagesModule, MessageModule, FileUploadModule, EditorModule, CardModule, ChipsModule, InputTextareaModule, DividerModule, SelectButtonModule, ToggleButtonModule, ContextMenuModule, TagModule, FormsModule, PanelModule, BlockUIModule, ColorPickerModule, InputTextModule, MultiSelectModule, AutoCompleteModule, DialogModule, AvatarModule, ButtonModule, SidebarModule, TooltipModule, SpeedDialModule, InputSwitchModule],
  templateUrl: './course-builder.page.component.html',
  styleUrl: './course-builder.page.component.css'
})
export class CourseBuilderPageComponent {
  /**
   * A reference to the graph component
   */
  @ViewChild('graphComponent') graphComponent!: GraphComponent;
  /**
   * The node to display information about in the node dialog popup
   */
  selectedNode!: Node;

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
   * Whether editing should be enabled or disabled
   */
  enableEdits: boolean = false;
  /**
   * True if in adding connection mode, false if not
   */
  addConnection: boolean = false;
  /**
   * True if in deleting elements mode, false if not
   */
  deleteElement: boolean = false;

  /**
   * Currently logged in user that will be assigned as course owner
   */
  courseOwner?: User;

  /**
   * If the course being edited has been saved or previously existed, this
   * will be populated
   */
  existingCourse?: Course;

  /**
   * The nodes of the displayed graph
   */
  nodes: Node[] = [];
  /**
   * The edges of the displayed graph
   */
  edges: Edge[] = [];
  /**
   * Clusters within the displayed graph, currently unused.
   */
  clusters: Cluster[] = [];

  /**
   * A variable used to store the source node for the newly made connections
   */
  private edgeSourceNode: Node | null = null;

  selectedName: string = "";
  selectedAvatarUrl: string = "https://primefaces.org/cdn/primeng/images/avatar/amyelsner.png";
  selectedTags: string[] = [];
  selectedDescription: string = "";

  addContentSidebarVisible: boolean = false;
  editorText: string = "";
  uploadedFiles: any[] = [];
  assessmentFile: any[] = [];
  newURL: string = '';
  urls: any[] = [];


  courseName: string = "Course Name";

  msgs: Message[] = [];

  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private historyService: HistoryService,
    private elementRef: ElementRef) {

    this.userService.getCurrentUser().subscribe((res) => {
      this.courseOwner = res;
    });
  }

  //#region UI Functions

  /**
   * Function which saves the current state of the course.
   */
  save(): void {
    this.updateNodeData();

    const courseObj: Course = {
      id: !!this.existingCourse ? this.existingCourse?.id : '',
      title: this.courseName,
      course_owner_id: this.courseOwner!.id,
      nodes: this.nodes,
      is_published: false
    };

    this.courseService.addOrUpdateCourse(courseObj)
      .subscribe((res) => {
        this.existingCourse = res;
        this.addMessage({ severity: 'success', summary: 'Success', detail: 'Course saved successfully.' });
      });
  }

  /**
   * Function which saves and publishes the course in its current state.
   */
  publish(): void {
    this.updateNodeData();

    const validationResult = this.hasCycle();
    if (validationResult.hasCycle == true) {
      this.setNodeColor(this.nodes.map((node) => node.id!), "var(--text-color)");
      this.setEdgeColor(this.edges.map((edge) => edge.id!), "var(--text-color)");

      this.setNodeColor(validationResult.cycleNodes, "#FF0000");
      this.setEdgeColor(validationResult.cycleEdges, "#FF0000");

      // some way to alert the user that there is a cycle
      this.addMessage({ severity: 'error', summary: 'Error', detail: 'There is an cycle in the course structure.' });
      return;
    }

    const courseObj: Course = {
      id: !!this.existingCourse ? this.existingCourse?.id : '',
      title: this.courseName,
      course_owner_id: this.courseOwner!.id,
      nodes: this.nodes,
      is_published: true
    };

    this.courseService.addOrUpdateCourse(courseObj)
      .subscribe((res) => {
        this.existingCourse = res;
        this.addMessage({ severity: 'success', summary: 'Success', detail: 'Course published successfully.' });
      });
  }

  /**
   * Function called when undo button is pressed. Updates the state to the previous state.
   */
  undo(): void {
    const newState = this.historyService.undo();
    if (!newState) {
      return;
    }
    this.nodes = [...newState.nodes];
    this.edges = [...newState.edges];
    this.clusters = [...newState.clusters];
  }

  /**
   * Function called when undo button is pressed. Updates the state to the new state.
   */
  redo(): void {
    const newState = this.historyService.redo();
    if (!newState) {
      return;
    }
    this.nodes = [...newState.nodes];
    this.edges = [...newState.edges];
    this.clusters = [...newState.clusters];
  }


  /**
   * This function fires when the user clicks the button to add a new lesson node.
   */
  addLesson(): void {
    if (!this.enableEdits) {
      return;
    }

    // TODO: maybe make this open a dialog that will ask for information about the lesson first?
    const newNode = {
      id: uid(),
      label: "Default Label",
      title: "Default Label",
      data: {
        tags: [],
        content: {}
      },
      color: "var(--text-color)"
    };
    this.nodes = [...this.nodes, newNode];

    // update the history
    this.historyService.saveCurrentState({
      nodes: this.nodes,
      edges: this.edges,
      clusters: this.clusters
    });

    this.selectedNode = newNode;
    this.selectedName = newNode.label || "";
    this.selectedTags = newNode.data.tags;
    this.graphComponent.panToNodeId(newNode.id);
    this.dialogVisible = true;
  }

  /**
   * This function fires whenever a node (or cluster) is clicked.
   *
   * @param node The node that was clicked in the graph component.
   */
  onNodeClick(node: Node) {
    if (this.enableEdits && this.deleteElement) {
      this.nodes = [...this.nodes.filter((n) => n.id !== node.id)];
      this.edges = [...this.edges.filter((edge) => edge.source !== node.id && edge.target !== node.id)];

      // update the history
      this.historyService.saveCurrentState({
        nodes: this.nodes,
        edges: this.edges,
        clusters: this.clusters
      });

      return;
    }

    if (this.enableEdits && this.addConnection) {
      // Select two nodes with different clicks then make the connection between them.
      if (!this.edgeSourceNode) {
        this.edgeSourceNode = node;
      } else {
        this.edges = [...this.edges, {
          id: uid(),
          source: this.edgeSourceNode.id!,
          target: node.id!,
          color: "var(--text-color)"
        }];
        this.edgeSourceNode = null;
      }

      // update the history
      this.historyService.saveCurrentState({
        nodes: this.nodes,
        edges: this.edges,
        clusters: this.clusters
      });

      return;
    }

    // No special editing mode is enabled, so save info about the current node
    this.updateNodeData();

    // Then pan and pull up the info about the node.
    this.selectedNode = node;
    this.selectedName = node.title || "";
    this.selectedDescription = node.data.short_description || "";
    this.selectedTags = node.data.tags || [];
    this.editorText = node.data.content.editorText || "";
    this.uploadedFiles = node.data.content.files || [];
    this.uploadedFiles = [...this.uploadedFiles];
    this.assessmentFile = node.data.content.assessmentFile || [];
    this.assessmentFile = [...this.assessmentFile];
    this.urls = node.data.content.thirdPartyUrls || [];

    this.graphComponent.panToNodeId(node.id!);
    this.dialogVisible = true;
  }

  /**
   * This function fires whenever an edge is clicked.
   *
   * @param edge the edge that was clicked in the graph component.
   */
  onEdgeClick(edge: Edge) {
    if (this.enableEdits && this.deleteElement) {
      this.edges = [...this.edges.filter((e) => e.id !== edge.id)];

      // update the history
      this.historyService.saveCurrentState({
        nodes: this.nodes,
        edges: this.edges,
        clusters: this.clusters
      });
    }
  }


  changeAvatarUrl() {
    const newUrl = prompt('Enter new URL for the avatar:');
    if (newUrl) {
      this.selectedAvatarUrl = newUrl;
    }
  }

  /**
   * Adds a URL to the list of 3rd party content URLs.
   */
  addURL() {
    if (this.newURL.trim() !== '') {
      this.urls.push(this.newURL.trim());
      this.newURL = ''; // Clear the input field
    }
  }

  /**
   * Remove a URL from the 3rd party content URLs list
   * @param index the index of the content URL to remove
   */
  removeURL(index: number) {
    if (index >= 0 && index < this.urls.length) {
      this.urls.splice(index, 1);
    }
  }

  /**
   *
   */
  onFileSelect(event: any) {
    this.uploadedFiles = [...this.uploadedFiles, ...event.files];
  }

  /**
   * Remove the content file that was selected to be removed
   */
  onRemoveContentFile(file: any) {
    const index = this.uploadedFiles.findIndex(f => f === file);
    this.uploadedFiles.splice(index, 1);
    this.uploadedFiles = [...this.uploadedFiles];
  }

  /**
   * Update the assessment file that is selected.
   */
  onAssessmentFileSelect(event: any) {
    this.assessmentFile = [...event.currentFiles];
  }

  /**
   * Removes the assessment file that was selected.
   */
  onRemoveAssessmentFile() {
    this.assessmentFile = [];
  }

  updateNodeData() {
    console.log(this.selectedNode);
    this.selectedNode.title = this.selectedName || "";
    this.selectedNode.data.short_description = this.selectedDescription || "";
    this.selectedNode.data.tags = this.selectedTags || [];
    this.selectedNode.data.content.editorText = this.editorText || "";
    this.selectedNode.data.content.files = this.uploadedFiles || [];
    this.selectedNode.data.content.thirdPartyUrls = this.urls || [];
    this.selectedNode.data.content.assessmentFile = this.assessmentFile || [];
    const index = this.nodes.findIndex(node => node.id === this.selectedNode.id);
    if (index !== -1) {
      this.nodes[index] = Object.assign({}, this.nodes[index], this.selectedNode);
    }

    this.nodes = [...this.nodes];
  }

  private addMessage(msg: Message) {
    this.msgs.push(msg);
    setTimeout(() => {
      this.msgs.shift();
      this.msgs = [...this.msgs];
    }, 5000);
    this.msgs = [...this.msgs];
  }

  //#endregion UI Functions


  //#region Node Highlighting

  /**
   * Highlight all the pre-requisites of a given node with the given color.
   *
   * @param selectedNode
   * @param color
   */
  highlightPreRequisites = (selectedNode: Node, color: string): void => {
    if (!selectedNode) {
      return;
    }
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
      if (!node.id) {
        return node;
      }

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
      if (!edge.id) {
        return edge;
      }

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
   * Performs DFS on the nodes in the graph to determine if there is a cycle.
   *
   * @returns an object containing information about the cycle and if it exists.
   */
  hasCycle = (): { hasCycle: boolean, cycleNodes: string[], cycleEdges: string[] } => {
    const visited: { [key: string]: boolean } = {};
    const recursionStack: { [key: string]: boolean } = {};
    const cycleNodes: string[] = [];
    const cycleEdges: string[] = [];

    const dfs = (currentNodeId: string, parentNodeId: string | null): boolean => {
      visited[currentNodeId] = true;
      recursionStack[currentNodeId] = true;
      cycleNodes.push(currentNodeId);

      for (const edge of this.edges) {
        if (edge.source === currentNodeId) {
          const targetNodeId = edge.target;
          if (!visited[targetNodeId]) {
            if (dfs(targetNodeId, currentNodeId)) {
              cycleEdges.push(edge.id!);
              return true;
            }
          } else if (recursionStack[targetNodeId] && targetNodeId !== parentNodeId) {
            cycleEdges.push(edge.id!);
            return true;
          }
        }
      }

      recursionStack[currentNodeId] = false;
      cycleNodes.pop(); // Remove the node from cycleNodes if it's not part of the cycle
      return false;
    };

    for (const node of this.nodes) {
      const nodeId = node.id;
      if (!visited[nodeId!]) {
        if (dfs(nodeId!, null)) {
          return { hasCycle: true, cycleNodes, cycleEdges };
        }
      }
    }
    return { hasCycle: false, cycleNodes: [], cycleEdges: [] };
  }

  //#endregion Helper Functions

}
