import type { DocumentType } from './document';

export interface GraphNode {
  id: string;
  label: string;
  type: DocumentType | 'tag';
}

export interface GraphEdge {
  source: string;
  target: string;
  type?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
