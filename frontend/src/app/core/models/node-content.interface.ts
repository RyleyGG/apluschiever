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
export interface Markdown {
    id: string;
    content: string;
}
