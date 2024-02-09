import {Course} from "./course.interface";


/**
 * Information representing a user
 */
export interface User {
    id: string,
    first_name: string,
    last_name: string,
    email_address: string
    owned_courses?: Course[];
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
    ids: string[],
    emails: string[],
}
