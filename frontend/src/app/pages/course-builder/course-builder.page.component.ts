import { Component, ElementRef, ViewChild, resolveForwardRef } from '@angular/core';
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
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { EditorModule } from 'primeng/editor';

import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';

import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { GraphComponent } from '../../graph/graph.component';
import { Node, Edge, Cluster, NodeOverview } from '../../graph/graph.interface';
import { CourseService } from '../../core/services/course/course.service';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { PanelModule } from 'primeng/panel';
import { DagreSettings, Orientation } from '../../graph/layouts/dagreCluster';
import { uid } from '../../core/utils/unique-id';
import { HistoryService } from '../../core/services/history/history.service';
import { Course, CourseFilters, CreateCourse, CreateCourseResponse } from "../../core/models/course.interface";
import { User } from "../../core/models/user.interface";
import { UserService } from "../../core/services/user/user.service";
import { Message } from 'primeng/api';
import { BlockableDiv } from '../../core/components/blockable-div/blockable-div.component';
import { UploadFile } from '../../core/models/node-content.interface';
import { readBlobAsBase64 } from '../../core/utils/blob-to-b64';

/**
 * The course view page component
 *
 * Right now it has a graph of dummy data being displayed.
 */
@Component({
  selector: 'course-build-page',
  standalone: true,
  imports: [CommonModule, GraphComponent, BlockUIModule, BlockableDiv, MessagesModule, MessageModule, FileUploadModule, EditorModule, CardModule, ChipsModule, InputTextareaModule, DividerModule, SelectButtonModule, ToggleButtonModule, ContextMenuModule, TagModule, FormsModule, PanelModule, BlockUIModule, ColorPickerModule, InputTextModule, MultiSelectModule, AutoCompleteModule, DialogModule, AvatarModule, ButtonModule, SidebarModule, TooltipModule, SpeedDialModule, InputSwitchModule],
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

  /**
   * The id of the course that is being built. Set to null or '' if the course being built is not already in the database.
   */
  courseid: string | null = null;

  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private historyService: HistoryService,
    private route: ActivatedRoute,
    private elementRef: ElementRef) {

    this.userService.getCurrentUser().subscribe((res) => {
      this.courseOwner = res;
    });

    this.courseid = this.route.snapshot.paramMap.get('id');
    if (this.courseid == null) { return; }

    // TODO, need to get the content for the nodes upon load. 
    this.courseService.getCourse(this.courseid).subscribe((data) => {
      this.constructGraphViewFromDatabase(data);

      // For some reason this needs to be 1 millisecond delayed at minimum for the zoom and center to apply. Probably for the CSS to update/apply
      setTimeout(() => {
        this.graphComponent.zoomToFit();
        this.graphComponent.panToCenter();
      }, 1);
    });

    // Set the existingCourse variable
    this.courseService.getCourses({ ids: [this.courseid] }).subscribe((data: Course[]) => {
      this.courseName = data[0].title;
    });
  }

  //#region UI Functions

  /**
   * Function which saves the current state of the course.
   * 
   * @param {boolean} and_publish should we also publish the course?
   */
  save = async (and_publish: boolean): Promise<void> => {
    this.updateNodeData();

    // Loop through the nodes to set the edges properly...
    await Promise.all(this.nodes.map(async (node: Node): Promise<void> => {
      // Set course ID & parents to basic
      node.course_id = this.courseid || '';
      node.parent_ids = [];

      // Setup all edges
      this.edges.forEach((edge: Edge) => {
        if (edge.target === node.id!) {
          node.parent_ids!.push(edge.source);
        }
      });

      // Setup the file stuff
      if (node.uploaded_files) {
        const newFileUploads: UploadFile[] = [];
        await Promise.all(node.uploaded_files.map(async (file: any) => {
          if (file.content) {
            newFileUploads.push(file);
            return new Promise((resolve, reject) => resolve(""));
          }
          const b64data = await readBlobAsBase64(new Blob([file], { type: file.type }));
          newFileUploads.push({
            ...(file.id ? { id: file.id } : {}),
            name: file.name,
            size: file.size,
            type: file.type,
            content: b64data // base64 data
          });
          return new Promise((resolve, reject) => resolve(""));
        }));
        node.uploaded_files = newFileUploads;
      }
    }));
    this.nodes = [...this.nodes];

    // Create the object to be sent to the database
    const courseObj: CreateCourse = {
      ...(this.courseid ? { id: this.courseid } : {}),
      title: this.courseName,

      course_owner_id: this.courseOwner!.id,
      is_published: and_publish,

      nodes: [...this.nodes],
      edges: []
    };

    this.edges.forEach((edge: Edge) => {
      // Use the still existing node id to identify source and target properly to setup the array for the backend...
      const sourceIndex = courseObj.nodes.findIndex((node: Node) => edge.source === node.id!);
      const targetIndex = courseObj.nodes.findIndex((node: Node) => edge.target === node.id!);
      courseObj.edges.push({ source: sourceIndex, target: targetIndex });
    });

    // Now delete the bad ids generated by the frontend.
    courseObj.nodes.forEach((node: Node) => {
      if (node.id!.length !== 36) { // 36 might not be good, but its working.
        delete node.id;
      }
    });

    this.courseService.addOrUpdateCourse(courseObj).subscribe((res: CreateCourseResponse) => {
      this.courseid = res.course.id;
      this.constructGraphViewFromDatabase(res);
      this.addMessage({ severity: 'success', summary: 'Success', detail: 'Course saved successfully.' });
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
      tags: [],
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
    this.selectedTags = newNode.tags;
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
    this.selectedDescription = node.short_description || "";
    this.selectedTags = node.tags || [];
    this.editorText = node.rich_text_files && node.rich_text_files?.length > 0 ? node.rich_text_files[0].content : "";
    this.uploadedFiles = node.uploaded_files && node.uploaded_files ? node.uploaded_files : [];
    this.assessmentFile = node.assessment_files && node.assessment_files.length > 0 ? node.assessment_files : [];
    this.assessmentFile = [...this.assessmentFile];
    this.urls = node.third_party_resources && node.third_party_resources.length > 0 ? node.third_party_resources.map((tpr) => tpr.embed_link) : [];

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
    console.log(this.uploadedFiles);
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
    if (!this.selectedNode) { return; }
    this.selectedNode.title = this.selectedName || "";
    this.selectedNode.short_description = this.selectedDescription || "";
    this.selectedNode.tags = this.selectedTags || [];
    this.selectedNode.rich_text_files = [{ content: this.editorText }] || [""];
    this.selectedNode.uploaded_files = this.uploadedFiles || [];
    this.selectedNode.third_party_resources = this.urls.map((url) => { return { embed_link: url, resource_source: '' } });
    this.selectedNode.assessment_files = this.assessmentFile || [];
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
   * Performs DFS lookup to find ALL cycles in the graph. Also, utilizes filters to determine all cycles
   * of length 2 and all self-edges. Returns this data in an object.
   *
   * @returns An object representing the cycles in the graph.
   */
  detectAllCycles = (): { hasCycle: boolean, cycles: { node_ids: string[], edge_ids: string[] }[] } => {
    const cycles: { node_ids: string[]; edge_ids: string[] }[] = [];
    const visited: { [key: string]: boolean } = {};
    const recursionStack: { [key: string]: boolean } = {};


    const dfs = (currentNode: string, parentNode: string | null, path: string[], edgeIds: string[]) => {
      visited[currentNode] = true;
      recursionStack[currentNode] = true;
      path.push(currentNode);

      for (const edge of this.edges) {
        if (edge.source === currentNode || edge.target === currentNode) {
          const nextNode = edge.target;

          if (!visited[nextNode]) {
            dfs(nextNode, currentNode, path, [...edgeIds, edge.id || ""]);
          } else if (recursionStack[nextNode] && nextNode !== parentNode) {
            const cycleStartIndex = path.indexOf(nextNode);
            const cycleNodes = path.slice(cycleStartIndex);
            const cycleEdges = edgeIds.slice(cycleStartIndex);

            // Check if the last edge connects back to the first node in the cycle
            if (cycleNodes.includes(cycleNodes[0])) {
              const lastEdge = this.edges.find((e: Edge) => (e.source === cycleNodes[cycleNodes.length - 1] && e.target === cycleNodes[0]) || (e.source === cycleNodes[0] && e.target === cycleNodes[cycleNodes.length - 1]));
              if (lastEdge) {
                cycleEdges.push(lastEdge.id!);
                cycles.push({ node_ids: cycleNodes, edge_ids: cycleEdges });
              }
            }
          }
        }
      }

      // Remove the node from the recursion stack after exploring its neighbors
      recursionStack[currentNode] = false;
      path.pop();
    }

    // Perform the DFS algorithm above to get all cycles length 3 or more
    for (const node of this.nodes) {
      if (!visited[node.id!]) {
        dfs(node.id!, null, [], []);
      }
    }

    // Use a set and a repeated lookup to get the cycles of length 2 and 1.
    const shortCycleEdges = this.edges.filter((edge1, index1) => {
      return this.edges.some((edge2, index2) => {
        // Check if there exists another edge where the source is the target of the current edge
        return index1 !== index2 && edge1.source === edge2.target && edge1.target === edge2.source;
      });
    });

    // Push in the short cycles that were found.
    shortCycleEdges.forEach((e: Edge) => {
      if (e.source === e.target) {
        cycles.push({ node_ids: [e.source], edge_ids: [e.id!] });
      } else {
        const match = this.edges.filter((e2: Edge) => { e2.source === e.target && e2.target === e.source }).map((e2: Edge) => e2.id!);

        cycles.push({ node_ids: [e.source, e.target], edge_ids: [e.id!, ...match] });
      }
    });

    return { hasCycle: cycles.length > 0, cycles };
  }

  private constructGraphViewFromDatabase = (data: CreateCourseResponse) => {
    console.log(data);
    this.nodes = [];
    this.edges = [];
    this.clusters = [];

    data.nodes.forEach((node: Node) => {
      this.nodes.push({
        ...node,
        color: "var(--text-color)"
      })
    });
    this.nodes.forEach((node: Node) => {

    });
    this.nodes = [...this.nodes];

    // Pass to create the edges
    if (!data.edges) { return; }

    // this.edges = [...data.edges];
    data.edges.forEach((edge: Edge) => {
      this.edges.push({
        ...edge,
        color: "var(--text-color)"
      });
    });
    this.edges = [...this.edges];
  }

  //#endregion Helper Functions

}
