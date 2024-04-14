import { Video , Markdown} from "./node-content.interface";
import {Course} from "./course.interface";
/**
 * Represents a node
 */
export interface Node {
    title: string;
    id: string;
    short_description: string;
    tags?:  string[];
    videos?: Video[];
    markdown_files?: Markdown[];
    uploaded_files?: string[];
    third_party?: string[];
    course_id: string;
    course?: Course;
    parents: Node[];
    children: Node[];
}
