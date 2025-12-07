export interface Snippet {
  id: string;
  name: string;
  description?: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
}

export interface SnippetData {
  name: string;
  description?: string;
  code: string;
  author?: string;
}

