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
    id: string;
    position?: NodePosition;
    dimension?: NodeDimension;
    transform?: string;
    label?: string;
    data?: any;
    color?: any;
    hidden?: boolean;
};

export interface Edge {
    id?: string;
    source: string;
    target: string;
    label?: string;
};

export interface Cluster {

};

export interface Graph {
    nodes: Node[];
    edges: Edge[];
    clusters?: Cluster[];
};

export interface Layout {
    settings?: any;
    run(graph: Graph): Graph | Observable<Graph>;
    updateEdge(graph: Graph, edge: Edge): Graph | Observable<Graph>;
    onDragStart?(draggingNode: Node, $event: MouseEvent): void;
    onDrag?(draggingNode: Node, $event: MouseEvent): void;
    onDragEnd?(draggingNode: Node, $event: MouseEvent): void;
};