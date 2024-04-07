import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {catchError, map, take, throwError} from "rxjs";
import {Course, CourseFilters} from "../../models/course.interface";
import {Node, NodeOverview} from "../../../graph/graph.interface";

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
      map((res: NodeOverview[]) => {
        console.log(res);
        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        // Something went really wrong
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all courses
   * @returns list of courses
   */
  getCourses(courseFilters: CourseFilters = {}) {
    return this.httpClient.post<any>(this.REST_API_SERVER + `course/search`, courseFilters).pipe(
      take(1),
      map((res: Course[]) => {
        console.log(res);
        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        // Something went really wrong
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates a given course
   * @returns the updated course
   */
  addOrUpdateCourse(course: Course) {
    console.log(course);

    // TODO: might be unneeded with model changes
    const {nodes, ...noNodeCourse} = course;

    return this.httpClient.post<Course>(this.REST_API_SERVER + `course/add_or_update/`, {
      course: noNodeCourse,
      nodes: course.nodes
    }).pipe(
      take(1),
      map((res: Course) => {
        return res;
      })
    )
  }

}
