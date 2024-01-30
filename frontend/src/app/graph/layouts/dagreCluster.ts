import { Observable } from "rxjs";
import { Edge, Graph, Layout, Node } from "../graph.interface";



export class DagreClusterLayout implements Layout {
    settings?: any;
    run(graph: Graph): Graph | Observable<Graph> {
        throw new Error("Method not implemented.");
    }
    updateEdge(graph: Graph, edge: Edge): Graph | Observable<Graph> {
        throw new Error("Method not implemented.");
    }
    onDragStart?(draggingNode: Node, $event: MouseEvent): void {
        throw new Error("Method not implemented.");
    }
    onDrag?(draggingNode: Node, $event: MouseEvent): void {
        throw new Error("Method not implemented.");
    }
    onDragEnd?(draggingNode: Node, $event: MouseEvent): void {
        throw new Error("Method not implemented.");
    }
};
