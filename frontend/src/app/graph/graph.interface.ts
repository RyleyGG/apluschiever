import { WritableSignal } from "@angular/core";
import { RichText, ThirdPartyResource, UploadFile, Video } from "../core/models/node-content.interface";
import { Course } from "../core/models/course.interface";

/**
 * Represents the position of a node
 */
export interface NodePosition {
  /**
   * The x position of the node
   */
  x: number;
  /**
   * The y position of the node
   */
  y: number;
};

/**
 * Represents the dimensions of a node
 */
export interface NodeDimension {
  /**
   * The width of the node
   */
  width: number;
  /**
   * The height of the node
   */
  height: number;
};

/**
 * Represents a node in the graph
 */
export interface Node {
  /**
   * The id for the node.
   *
   * If not set explicitly, then the GraphComponent will create a unique ID for it based on the date, time, and a large random number
   */
  id?: string;

  // graphing specific attributes
  position?: NodePosition;
  dimension?: NodeDimension;
  transform?: string;
  color?: string; // Hex string for a color.
  meta?: any;
  hidden?: boolean;
  complete?: boolean; // whether the currently logged in user has completed the node or not

  // attributes pertaining to node data
  title?: string;
  short_description?: string;
  tags?: string[];
  videos?: Video[];
  rich_text_files?: RichText[];
  uploaded_files?: UploadFile[];
  third_party_resources?: ThirdPartyResource[]
  assessment_files?: any;
  course_id?: string;
  parent_ids?: string[];
};

export interface NodeOverview {
  id?: string;
  title: string;
  short_description: string;
  parent_nodes: Node[];
  complete: boolean;
  tags: string[];
  content_types: string[];
}

/**
 * Represents an edge in the graph. Edges are directed.
 */
export interface Edge {
  id?: string;
  /**
   * The id of the node the edge should start from.
   */
  source: string;
  /**
   * The id of the node the edge should go to.
   */
  target: string;

  color?: string; // Hex string for a color.

  points?: any;
  line?: any;
  oldLine?: any;
  label?: string;
  textPath?: any;
  oldTextPath?: string;

  data?: any | undefined;

  midPoint?: NodePosition;
  dominantBaseline?: string;

  textAngle?: number;
  textTransform?: string;
};

/**
 * Represents a cluster of nodes in the graph.
 *
 * A cluster is really just a special kind of node, which contains multiple children in it.
 */
export interface Cluster extends Node {
  childNodeIds?: string[];
};

/**
 * Represents a graph comprised of nodes, edges, and clusters.
 */
export interface Graph {
  /**
   * An array of nodes within the graph.
   */
  nodes: Node[];
  /**
   * An array of edges within the graph.
   */
  edges: Edge[];
  /**
   * An array of clusters within the graph.
   */
  clusters?: Cluster[];
  /**
   * The edge labels for the graph.
   */
  edgeLabels?: any;
};

/**
 * The interface for a 'Layout' which is used by the GraphComponent to actually render the graph.
 */
export interface Layout {
  /**
   * The settings for the layout.
   */
  settings?: any;

  /**
   *
   * @param graph
   */
  run(graph: Graph): Graph | WritableSignal<Graph>;

  /**
   *
   * @param graph
   * @param edge
   */
  updateEdge(graph: Graph, edge: Edge): Graph | WritableSignal<Graph>;
};
