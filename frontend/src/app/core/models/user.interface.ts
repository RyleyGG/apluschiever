import {Course} from "./course.interface";


/**
 * Information representing a user
 */
export interface User {
    id: string,
    first_name: string,
    last_name: string,
    email_address: string,
    user_type: string,
    owned_courses?: Course[];
    enrolled_courses?: Course[];
}

/**
 * Available filtering options for users
 */
export interface UserFilters {
    ids: string[],
    emails: string[],
    user_types: string[]
}

export enum UserType {
    STUDENT = 'Student',
    ADMIN = 'Administrator',
    TEACHER = 'Teacher',
}
