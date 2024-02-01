import {Course} from "./course.interface";


/**
 * Information representing a user
 */
export interface User {
    id: string,
    first_name: string,
    last_name: string,
    email_address: string
    courses?: Course[]; // Optional list of courses the user owns
}

/**
 * Available filtering options for users
 */
export interface UserFilters {
    ids: string[],
    emails: string[],
}
