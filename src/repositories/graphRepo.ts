import { getDatabase } from '../database/db';

import {
    normalizeDocumentType,
} from '../types/document';

import type {
    GraphData,
    GraphEdge,
    GraphNode,
} from '../types/graph';

interface CenterDocumentRow {
    id: string;
    title: string;
    document_type: string;
}

interface GraphRelationRow {
    source_id: string;
    source_label: string;
    source_type: string;

    target_id: string;
    target_label: string;
    target_type: string;

    link_type: string;
}

interface TagRelationRow {
    tag_id: string | number;
    tag_name: string;
}

export async function buildLocalGraph(
    documentId: string,
): Promise<GraphData> {
    const normalizedDocumentId =
        documentId.trim();

    if (!normalizedDocumentId) {
        return {
            nodes: [],
            edges: [],
        };
    }

    const db = await getDatabase();

    const centerRows =
        await db.select<CenterDocumentRow[]>(
            `
        SELECT
          id,
          title,
          document_type
        FROM documents
        WHERE id = ?
        LIMIT 1
      `,
            [normalizedDocumentId],
        );

    const centerRow = centerRows[0];

    if (!centerRow) {
        return {
            nodes: [],
            edges: [],
        };
    }

    /*
     * outgoing과 incoming을 하나의 쿼리로 조회한다.
     * 두 문서가 모두 실제 documents 테이블에 있는 관계만
     * Cytoscape 문서 노드로 구성한다.
     */
    const relationRows =
        await db.select<GraphRelationRow[]>(
            `
        SELECT
          source.id AS source_id,
          source.title AS source_label,
          source.document_type AS source_type,

          target.id AS target_id,
          target.title AS target_label,
          target.document_type AS target_type,

          link.link_type
        FROM document_links link

        INNER JOIN documents source
          ON source.id = link.source_document_id

        INNER JOIN documents target
          ON target.id = link.target_document_id

        WHERE
          link.source_document_id = ?
          OR link.target_document_id = ?
      `,
            [
                normalizedDocumentId,
                normalizedDocumentId,
            ],
        );

    /*
     * 선택 문서에 연결된 태그도 뉴런 그래프 노드로 포함한다.
     */
    const tagRows =
        await db.select<TagRelationRow[]>(
            `
        SELECT
          tag.id AS tag_id,
          tag.name AS tag_name
        FROM document_tags document_tag

        INNER JOIN tags tag
          ON tag.id = document_tag.tag_id

        WHERE document_tag.document_id = ?

        ORDER BY tag.name ASC
      `,
            [normalizedDocumentId],
        );

    const nodeMap = new Map<
        string,
        GraphNode
    >();

    const edgeMap = new Map<
        string,
        GraphEdge
    >();

    /*
     * 중심 문서 노드
     */
    nodeMap.set(centerRow.id, {
        id: centerRow.id,
        label: centerRow.title,
        type: normalizeDocumentType(
            centerRow.document_type,
        ),
    });

    /*
     * 연결 문서 노드 및 edge
     */
    for (const relation of relationRows) {
        nodeMap.set(relation.source_id, {
            id: relation.source_id,
            label: relation.source_label,
            type: normalizeDocumentType(
                relation.source_type,
            ),
        });

        nodeMap.set(relation.target_id, {
            id: relation.target_id,
            label: relation.target_label,
            type: normalizeDocumentType(
                relation.target_type,
            ),
        });

        const edge: GraphEdge = {
            source: relation.source_id,
            target: relation.target_id,
            type: relation.link_type || 'wiki-link',
        };

        const edgeKey = [
            edge.source,
            edge.target,
            edge.type,
        ].join('::');

        edgeMap.set(edgeKey, edge);
    }

    /*
     * 중심 문서와 태그 사이 관계
     */
    for (const tag of tagRows) {
        const tagNodeId =
            `tag:${String(tag.tag_id)}`;

        nodeMap.set(tagNodeId, {
            id: tagNodeId,
            label: tag.tag_name,
            type: 'tag',
        });

        const tagEdge: GraphEdge = {
            source: normalizedDocumentId,
            target: tagNodeId,
            type: 'tag',
        };

        const edgeKey = [
            tagEdge.source,
            tagEdge.target,
            tagEdge.type,
        ].join('::');

        edgeMap.set(edgeKey, tagEdge);
    }

    return {
        nodes: Array.from(nodeMap.values()),
        edges: Array.from(edgeMap.values()),
    };
}