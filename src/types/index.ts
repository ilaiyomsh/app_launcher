export interface Snippet {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
}

export interface SnippetData {
  name: string;
  code: string;
  author?: string;
}

