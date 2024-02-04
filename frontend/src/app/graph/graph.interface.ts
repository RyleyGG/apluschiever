import { Observable } from "rxjs";

export interface NodePosition {
    x: number;
    y: number;
}

export interface NodeDimension {
    width: number;
    height: number;
}

export interface Node {
    meta?: any;
    id: string;
    parentId?: string;
    position?: NodePosition;
    dimension?: NodeDimension;
    transform?: string;
    label?: string;
    data?: any;
    hidden?: boolean;
};

export interface Edge {
    data?: Edge | undefined;
    dominantBaseline?: string;
    id?: string;
    source: string;
    target: string;
    label?: string;
    points?: any;
    textPath?: any;
    line?: any;

    textTransform?: string;
    textAngle?: number;
    oldLine?: any;
    oldTextPath?: string;
    midPoint?: NodePosition;
};

export interface Cluster extends Node {
    childNodeIds?: string[];
};

export interface Graph {
    nodes: Node[];
    edges: Edge[];
    clusters?: Cluster[];
    edgeLabels?: any;
};

export interface Layout {
    settings?: any;
    run(graph: Graph): Graph | Observable<Graph>;
    updateEdge(graph: Graph, edge: Edge): Graph | Observable<Graph>;
    onDragStart?(draggingNode: Node, $event: MouseEvent): void;
    onDrag?(draggingNode: Node, $event: MouseEvent): void;
    onDragEnd?(draggingNode: Node, $event: MouseEvent): void;
};