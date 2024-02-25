import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, take, throwError } from "rxjs";

/**
 * A service which interacts with the course endpoints.
 */
@Injectable({
    providedIn: 'root'
})
export class CourseService {
    /**
     * The server to hit
     */
    private REST_API_SERVER = "http://localhost:8000/";

    /**
     * 
     */
    constructor(private httpClient: HttpClient) {

    }

    // '/node/progress/{course_id}'

    // '/node/update_node' -> send node update in body

    /**
     * Get all the nodes for a course
     * @param course_id 
     * @returns
     */
    getNodes(course_id: string) {
        return this.httpClient.get<any>(this.REST_API_SERVER + `course/nodes/${course_id}`).pipe(
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

}