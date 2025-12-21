export interface Snippet {
  id: string;
  name: string;
  description?: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  author: string; // חובה - כל כלי חייב להיות עם יוצר
  category?: string; // ID של קטגוריה
  tags: string[]; // מערך של IDs של תגיות
}

export interface SnippetData {
  name: string;
  description?: string;
  code: string;
  author: string; // חובה - כל כלי חייב להיות עם יוצר
  category?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string; // צבע לתצוגה (HEX)
  createdBy: string; // email של היוצר
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
}

// טיפוסים לסינון ומיון
export type SortField = 'updatedAt' | 'createdAt' | 'name' | 'author';
export type SortDirection = 'asc' | 'desc';

export interface FilterOptions {
  search?: string;
  categories?: string[]; // מערך של category IDs
  tags?: string[];
  authors?: string[]; // מערך של author emails
  sortBy?: SortField;
  sortDirection?: SortDirection;
}

