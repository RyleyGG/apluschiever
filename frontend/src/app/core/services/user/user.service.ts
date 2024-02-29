import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, take, throwError } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UserService {
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
   * Get all courses
   * @returns
   */
  getUserCourses() {
      return this.httpClient.post<any>(this.REST_API_SERVER + `user/search_courses`, {}).pipe(
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
  /**
   * Get all courses
   * @param course_id 
   * 
   */
  addCourse(course_id: string) {
    return this.httpClient.get<any>(this.REST_API_SERVER + `user/add_course/${course_id}`, {}).pipe(
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