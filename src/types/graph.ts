import type { DocumentType } from './document';

export type GraphNodeType =
  | DocumentType
  | 'tag';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType | 'tag';
}

export interface GraphEdge {
  source: string;
  target: string;
  type: GraphNodeType | 'tag';
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}