import type { Tag } from './Tag';

export interface Bookmark {
    id: number;
    url: string;
    site: string;
    description: string;
    tags: Tag[];
    date: string;
    score?: number; 
}
