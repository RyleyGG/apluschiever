import {Markdown, Video} from "./node-content.interface";
import {User} from "./user.interface";

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
    enrolled_students?: User[];
}
