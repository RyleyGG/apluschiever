import {Markdown, Video} from "./node-content.interface";
import {User} from "./user.interface";


/**
 * Represents a content node within a course, including videos and markdown files.
 */
export interface Node {
    id: string;
    title: string;
    shortDescription: string;
    videos?: Video[];
    markdownFiles?: Markdown[];
    courses: Course[];
}

/**
 * Represents a course, including its associated nodes and owner.
 */
export interface Course {
    id: string;
    title: string;
    shortDescription?: string;
    courseOwnerId: string;
    courseOwner: User;
    nodes: Node[];
}
