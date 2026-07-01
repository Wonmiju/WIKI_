import { getDatabase } from '../database/db';

import {
    normalizeDocumentType,
    type Document,
    type DocumentSummary,
} from '../types/document';

interface DocumentRow {
    id: string;
    path: string;
    title: string;
    document_type: string;
    content: string;
    created_at: string | Date;
    updated_at: string | Date;
}

interface DocumentSummaryRow {
    id: string;
    path: string;
    title: string;
    document_type: string;
    created_at: string | Date;
    updated_at: string | Date;
}

interface ValueRow {
    value: string;
}

function normalizeDate(
    value: string | Date,
): string {
    if (value instanceof Date) {
        return value.toISOString();
    }

    return String(value);
}

function mapDocumentSummary(
    row: DocumentSummaryRow,
): DocumentSummary {
    return {
        id: row.id,
        path: row.path,
        title: row.title,
        documentType: normalizeDocumentType(
            row.document_type,
        ),
        createdAt: normalizeDate(row.created_at),
        updatedAt: normalizeDate(row.updated_at),
    };
}

export async function findAllDocuments():
    Promise<DocumentSummary[]> {
    const db = await getDatabase();

    const rows = await db.select<DocumentSummaryRow[]>(`
    SELECT
      id,
      path,
      title,
      document_type,
      created_at,
      updated_at
    FROM documents
    ORDER BY title ASC
  `);

    return rows.map(mapDocumentSummary);
}

export async function findDocumentById(
    id: string,
): Promise<Document | null> {
    const db = await getDatabase();

    const rows = await db.select<DocumentRow[]>(
        `
      SELECT
        id,
        path,
        title,
        document_type,
        content,
        created_at,
        updated_at
      FROM documents
      WHERE id = ?
      LIMIT 1
    `,
        [id],
    );

    const row = rows[0];

    if (!row) {
        return null;
    }

    const [
        tags,
        aliases,
        outgoingLinks,
        backlinks,
    ] = await Promise.all([
        db.select<ValueRow[]>(
            `
        SELECT t.name AS value
        FROM tags t
        INNER JOIN document_tags dt
          ON dt.tag_id = t.id
        WHERE dt.document_id = ?
        ORDER BY t.name ASC
      `,
            [id],
        ),

        db.select<ValueRow[]>(
            `
        SELECT alias AS value
        FROM document_aliases
        WHERE document_id = ?
        ORDER BY alias ASC
      `,
            [id],
        ),

        /*
         * 실제 문서와 연결된 링크는 documents.title을 사용하고,
         * 아직 대상 문서가 없는 링크는 target_title을 사용한다.
         */
        db.select<ValueRow[]>(
            `
        SELECT
          COALESCE(target.title, link.target_title)
            AS value
        FROM document_links link
        LEFT JOIN documents target
          ON target.id = link.target_document_id
        WHERE link.source_document_id = ?
        ORDER BY value ASC
      `,
            [id],
        ),

        db.select<ValueRow[]>(
            `
        SELECT source.title AS value
        FROM document_links link
        INNER JOIN documents source
          ON source.id = link.source_document_id
        WHERE link.target_document_id = ?
        ORDER BY source.title ASC
      `,
            [id],
        ),
    ]);

    return {
        id: row.id,
        path: row.path,

        frontmatter: {
            id: row.id,
            title: row.title,
            type: normalizeDocumentType(
                row.document_type,
            ),
            tags: tags.map((item) => item.value),
            aliases: aliases.map(
                (item) => item.value,
            ),
            created: normalizeDate(row.created_at),
            updated: normalizeDate(row.updated_at),
        },

        outgoingLinks: outgoingLinks.map(
            (item) => item.value,
        ),

        backlinks: backlinks.map(
            (item) => item.value,
        ),

        content: row.content,
    };
}

export async function findDocumentByTitle(
    title: string,
): Promise<Document | null> {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
        return null;
    }

    const db = await getDatabase();

    const rows = await db.select<
        { id: string }[]
    >(
        `
      SELECT d.id
      FROM documents d
      WHERE LOWER(d.title) = LOWER(?)

      UNION

      SELECT d.id
      FROM documents d
      INNER JOIN document_aliases a
        ON a.document_id = d.id
      WHERE LOWER(a.alias) = LOWER(?)

      LIMIT 1
    `,
        [normalizedTitle, normalizedTitle],
    );

    const id = rows[0]?.id;

    if (!id) {
        return null;
    }

    return findDocumentById(id);
}

export async function findRecentDocuments(
    limit = 5,
): Promise<DocumentSummary[]> {
    const db = await getDatabase();

    const safeLimit = Math.max(
        1,
        Math.min(Math.trunc(limit), 50),
    );

    const rows = await db.select<DocumentSummaryRow[]>(`
    SELECT
      id,
      path,
      title,
      document_type,
      created_at,
      updated_at
    FROM documents
    ORDER BY updated_at DESC
    LIMIT ${safeLimit}
  `);

    return rows.map(mapDocumentSummary);
}

/*
 * Markdown 본문 저장용 Repository 함수.
 * 저장 후 최신 Document를 다시 반환한다.
 */
export async function updateDocumentContent(
    id: string,
    content: string,
): Promise<Document> {
    const documentId = id.trim();

    if (!documentId) {
        throw new Error(
            '수정할 문서 ID가 비어 있습니다.',
        );
    }

    const db = await getDatabase();

    const result = await db.execute(
        `
      UPDATE documents
      SET
        content = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
        [content, documentId],
    );

    if (result.rowsAffected === 0) {
        throw new Error(
            `문서를 찾을 수 없습니다: ${documentId}`,
        );
    }

    const updatedDocument =
        await findDocumentById(documentId);

    if (!updatedDocument) {
        throw new Error(
            '문서는 수정되었지만 최신 데이터를 다시 읽지 못했습니다.',
        );
    }

    return updatedDocument;
}