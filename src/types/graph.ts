import type { DocumentType } from './document';

export type GraphNodeType =
  | DocumentType
  | 'tag';

export type GraphEdgeType =
  | 'wiki-link'
  | 'backlink'
  | 'tag'
  | string;

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: GraphEdgeType;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}