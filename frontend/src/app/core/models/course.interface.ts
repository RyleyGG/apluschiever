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
  is_published: boolean
}

export interface CourseFilters {
  ids?: string[];
  owned_by?: string;
  course_title?: string;
  is_published?: boolean;
}
