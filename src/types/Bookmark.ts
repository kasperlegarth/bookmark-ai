export interface Bookmark {
    id: number;
    url: string;
    site: string;
    description: string;
    tags: string[];
    score?: number; 
}
