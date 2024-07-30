export interface Solution{id: number;title: string;  description: string; link: string;version: string;dateOfPosting: Date;attachment: any;idCategory: number}
export interface Category{id: number;title: string;description: string; }
export interface Comment{
    id: number;
    content: string;
    dateOfPosting: Date;
    idApplication: number;
}