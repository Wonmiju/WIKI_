import { getDatabase } from '../database/db';

import type {
    GraphData,
    GraphNode,
    GraphEdge,
    GraphNodeType,
} from '../types/graph';

interface GraphNodeRow {
    id: string;
    label: string;
    type: GraphNodeType;
}

interface GraphEdgeRow {
    source: string;
    target: string;
    type: GraphNodeType;
}

export async function buildLocalGraph(
    documentId: string,
): Promise<GraphData> {
    const db = await getDatabase();

    const centerRows = await db.select<GraphNodeRow[]>(
        `
    SELECT
      id,
      title AS label,
      document_type AS type
    FROM documents
    WHERE id = ?
    LIMIT 1
    `,
        [documentId],
    );

    const center = centerRows[0];

    if (!center) {
        return {
            nodes: [],
            edges: [],
        };
    }

    const relatedNodes = await db.select<GraphNodeRow[]>(
        `
    SELECT DISTINCT
      d.id,
      d.title AS label,
      d.document_type AS type
    FROM documents d
    WHERE d.id IN (
      SELECT target_document_id
      FROM document_links
      WHERE
        source_document_id = ?
        AND target_document_id IS NOT NULL

      UNION

      SELECT source_document_id
      FROM document_links
      WHERE target_document_id = ?
    )
    `,
        [documentId, documentId],
    );

    const outgoingEdges = await db.select<GraphEdgeRow[]>(
        `
    SELECT
      source_document_id AS source,
      target_document_id AS target,
      link_type AS type
    FROM document_links
    WHERE
      source_document_id = ?
      AND target_document_id IS NOT NULL
    `,
        [documentId],
    );

    const backlinkEdges = await db.select<GraphEdgeRow[]>(
        `
    SELECT
      source_document_id AS source,
      target_document_id AS target,
      'backlink' AS type
    FROM document_links
    WHERE target_document_id = ?
    `,
        [documentId],
    );

    const nodeMap = new Map<string, GraphNode>();
    const edgeMap = new Map<string, GraphEdge>();

    nodeMap.set(center.id, center);

    for (const node of relatedNodes) {
        nodeMap.set(node.id, node);
    }

    for (const edge of [
        ...outgoingEdges,
        ...backlinkEdges,
    ]) {
        const key = `${edge.source}-${edge.target}-${edge.type}`;
        edgeMap.set(key, edge);
    }

    return {
        nodes: Array.from(nodeMap.values()),
        edges: Array.from(edgeMap.values()),
    };
}