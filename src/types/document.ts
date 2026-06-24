export type DocumentType =
  | 'paper'
  | 'model'
  | 'module'
  | 'dataset'
  | 'concept'
  | 'experiment';

export interface DocumentFrontmatter {
  id: string;
  title: string;
  type: DocumentType;
  tags: string[];
  aliases?: string[];
  created?: string;
  updated?: string;
}

export interface Document {
  id: string;
  path: string;
  frontmatter: DocumentFrontmatter;
  content: string;
  outgoingLinks: string[];
  backlinks: string[];
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  children?: FileTreeNode[];
  documentId?: string;
}
