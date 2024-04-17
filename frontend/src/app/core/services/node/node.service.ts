import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {catchError, map, Observable, take, throwError} from "rxjs";
import {NodeProgressDetails} from "../../models/node-content.interface";

/**
 * A service which interacts with the node endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class NodeService {
  /**
   * The server to hit
   */
  private REST_API_SERVER = "http://localhost:8000/";

  /**
   *
   */
  constructor(private httpClient: HttpClient) {

  }

  /**
   * Get all the nodes for a course
   * @param node_id
   * @returns
   */
  getNode(node_id: string) {
    return this.httpClient.get<any>(this.REST_API_SERVER + `node/view_node/${node_id}`).pipe(
      take(1),
      map((res: any) => {
        console.log(res);
        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        // Something went really wrong
        return throwError(() => error);
      })
    );
  }


  updateNodeProgress(nodeProgressDetails: NodeProgressDetails): Observable<NodeProgressDetails> {
    return this.httpClient.post<NodeProgressDetails>(this.REST_API_SERVER + `node/update_node`, nodeProgressDetails).pipe(
      take(1),
      map((res: NodeProgressDetails) => {
        return res;
      })
    )
  }
}
