/**
 * Represents a video content type.
 */
export interface Video {
    id: string;
    embedLink: string;
    videoSource: string;
}

/**
 * Represents a markdown content type.
 */
export interface RichText {
    id: string;
    content: string;
}


/**
 * Represents an embedded third party resource
 */
export interface ThirdPartyResource {
  embedLink: string;
  resourceSource: string;
}


/**
 * Represents an uploaded file
 */
export interface UploadFile {
  fileName: string;
  fileContent: Blob;
}


export interface NodeProgressDetails {
    node_id: string
    completed_content: string[]
}
