import {User} from "./user.interface";
import {Node} from '../../graph/graph.interface';
import {RichText, Video} from "./node-content.interface";

/**
 * Represents a course, including its associated nodes and owner.
 */
export interface Course {
  id: string;
  title: string;
  short_description?: string;
  course_owner_id: string;
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
