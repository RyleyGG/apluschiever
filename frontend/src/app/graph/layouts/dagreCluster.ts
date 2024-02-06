import { uid } from "../../core/utils/unique-id";
import { Cluster, Edge, Graph, Layout, Node } from "../graph.interface";
import * as dagre from 'dagre';

export enum Orientation {
    LEFT_TO_RIGHT = 'LR',
    RIGHT_TO_LEFT = 'RL',
    TOP_TO_BOTTOM = 'TB',
    BOTTOM_TO_TOM = 'BT'
};

export enum Alignment {
    CENTER = 'C',
    UP_LEFT = 'UL',
    UP_RIGHT = 'UR',
    DOWN_LEFT = 'DL',
    DOWN_RIGHT = 'DR'
};

export interface DagreSettings {
    orientation?: Orientation;
    marginX?: number;
    marginY?: number;
    edgePadding?: number;
    rankPadding?: number;
    nodePadding?: number;
    align?: Alignment;
    acyclicer?: 'greedy' | undefined;
    ranker?: 'network-simplex' | 'tight-tree' | 'longest-path';
    multigraph?: boolean;
    compound?: boolean;
};

export class DagreClusterLayout implements Layout {
    static defaultSettings: DagreSettings = {
        orientation: Orientation.LEFT_TO_RIGHT,
        marginX: 20,
        marginY: 20,
        edgePadding: 100,
        rankPadding: 100,
        nodePadding: 50,
        multigraph: true,
        compound: true
    };

    settings: DagreSettings = {};

    dagreGraph: any;
    dagreNodes!: Node[];
    dagreClusters!: Cluster[];
    dagreEdges: any;



    run(graph: Graph): Graph {
        this.createDagreGraph(graph);
        console.log("DAGRE GRAPH MADE");

        dagre.layout(this.dagreGraph);

        graph.edgeLabels = this.dagreGraph._edgeLabels;

        const dagreToOutput = (node: any) => {
            const dagreNode = this.dagreGraph._nodes[node.id];
            return {
                ...node,
                position: {
                    x: dagreNode.x,
                    y: dagreNode.y
                },
                dimension: {
                    width: dagreNode.width,
                    height: dagreNode.height
                }
            };
        };

        graph.clusters = (graph.clusters || []).map(dagreToOutput);
        graph.nodes = graph.nodes.map(dagreToOutput);

        return graph;
    }

    updateEdge(graph: Graph, edge: Edge): Graph {
        const srcNode = graph.nodes.find(n => n.id === edge.source) as any;
        const destNode = graph.nodes.find(n => n.id === edge.target) as any;

        // Find the new start and end points for the edge
        const direction = srcNode.position.y <= destNode.position.y ? -1 : 1;
        const startPoint = {
            x: srcNode.position.x,
            y: srcNode.position.y + direction * (srcNode.dimension.height / 2)
        };
        const endPoint = {
            x: destNode.position.x,
            y: destNode.position.y + direction * (destNode.dimension.height / 2)
        };

        edge.points = [startPoint, endPoint];
        return graph;
    }

    private createDagreGraph(graph: Graph): void {
        const settings = Object.assign({}, DagreClusterLayout.defaultSettings, this.settings);
        this.dagreGraph = new dagre.graphlib.Graph({ compound: settings.compound, multigraph: settings.multigraph });

        this.dagreGraph.setGraph({
            rankdir: settings.orientation,
            marginx: settings.marginX,
            marginy: settings.marginY,
            edgesep: settings.edgePadding,
            ranksep: settings.rankPadding,
            nodesep: settings.nodePadding,
            align: settings.align,
            acyclicer: settings.acyclicer,
            ranker: settings.ranker,
            multigraph: settings.multigraph,
            compound: settings.compound
        });

        this.dagreGraph.setDefaultEdgeLabel(() => { /* empty */ });

        // Assign Nodes
        this.dagreNodes = graph.nodes.map((n: Node) => {
            const node: any = Object.assign({}, n);
            node.width = n.dimension!.width;
            node.height = n.dimension!.height;
            node.x = n.position!.x;
            node.y = n.position!.y;
            return node;
        });

        // Assign Clusters
        this.dagreClusters = graph.clusters || [];

        // Assign Edges
        this.dagreEdges = graph.edges.map(l => {
            const newLink: any = Object.assign({}, l);
            if (!newLink.id) {
                newLink.id = uid();
            }
            return newLink;
        });


        for (const node of this.dagreNodes) {
            this.dagreGraph.setNode(node.id, node);
        }

        for (const cluster of this.dagreClusters) {
            this.dagreGraph.setNode(cluster.id, cluster);
            cluster.childNodeIds?.forEach(childNodeId => {
                this.dagreGraph.setParent(childNodeId, cluster.id);
            });
        }

        for (const edge of this.dagreEdges) {
            if (settings.multigraph) {
                this.dagreGraph.setEdge(edge.source, edge.target, edge, edge.id);
            } else {
                this.dagreGraph.setEdge(edge.source, edge.target);
            }
        }
    }
};
