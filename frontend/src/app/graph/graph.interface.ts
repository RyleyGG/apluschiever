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
}