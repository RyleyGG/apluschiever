/**
 * Represents a video content type.
 */
export interface Video {
  id?: string;
  embed_link: string;
  video_source: string;
}

/**
 * Represents a markdown content type.
 */
export interface RichText {
  id?: string;
  content: string;
}


/**
 * Represents an embedded third party resource
 */
export interface ThirdPartyResource {
  id?: string;
  embed_link: string;
  resource_source: string;
}


/**
 * Represents an uploaded file
 */
export interface UploadFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  content: string;
}


export interface NodeProgressDetails {
  node_id: string
  node_complete: boolean
}
