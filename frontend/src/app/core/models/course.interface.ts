import { User } from "./user.interface";
import { Edge, Node } from '../../graph/graph.interface';
import { RichText, Video } from "./node-content.interface";

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
  owned_by?: string[];
  course_title?: string;
  is_published?: boolean;
}

export interface CreateCourse {
  id?: string,
  title: string;
  short_description?: string;

  course_owner_id: string;
  is_published: boolean

  nodes: Node[], // really CreateNode on backend
  edges: { source: number, target: number }[] // really CreateEdge on backend
}

export interface CreateCourseResponse {
  course: Course,
  nodes: Node[],
  edges: Edge[]
}