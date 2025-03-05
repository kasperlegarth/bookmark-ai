export interface Bookmark {
    id: number;
    url: string;
    site: string;
    description: string;
    tags: string[];
    date: string;
    score?: number; 
}
