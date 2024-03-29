import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, take, throwError } from "rxjs";
import { User } from "../../models/user.interface";

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
     * Get the logged in user's information
     */
    getCurrentUser() {
        return this.httpClient.post<any>(this.REST_API_SERVER + `user/me`, {}).pipe(
            take(1),
            map((res: any) => {
                console.log(res);
                return res;
            }),
            catchError((error: HttpErrorResponse) => {
                // Something went really wrong
                return throwError(() => error);
            })
        )
    }

    updateCurrentUser(new_user_data: User) {
        console.log(new_user_data)
        return this.httpClient.post<any>(this.REST_API_SERVER + `user/update_user`, new_user_data).pipe(
            take(1),
            map((res: any) => {
                console.log(res);
                return res;
            }),
            catchError((error: HttpErrorResponse) => {
                // Something went really wrong
                return throwError(() => error);
            })
        )
    }

    /**
     * Get all courses the user is enrolled in
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

    getUserCoursesProgress(course_ids: string[]) {
        return this.httpClient.post<any>(this.REST_API_SERVER + `user/course_progress`, course_ids).pipe(
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
     * Add the user to a course
     * @param course_id the course id of the course to enroll in
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

    /**
     * Remove the user from a course
     * @param course_id the course id of the course to remove the user from
     */
    removeCourse(course_id: string) {
        return this.httpClient.get<any>(this.REST_API_SERVER + `user/remove_course/${course_id}`, {}).pipe(
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