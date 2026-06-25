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

export async function findAllDocuments():
    Promise<DocumentSummary[]> {
    const db = await getDatabase();

    const rows = await db.select<DocumentRow[]>(`
    SELECT
      id,
      path,
      title,
      document_type,
      content,
      created_at,
      updated_at
    FROM documents
    ORDER BY title ASC
  `);

    return rows.map((row) => ({
        id: row.id,
        path: row.path,
        title: row.title,

        /*
         * string → DocumentType
         */
        documentType: normalizeDocumentType(
            row.document_type,
        ),

        createdAt: normalizeDate(row.created_at),
        updatedAt: normalizeDate(row.updated_at),
    }));
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
      ORDER BY t.name
      `,
            [id],
        ),

        db.select<ValueRow[]>(
            `
      SELECT alias AS value
      FROM document_aliases
      WHERE document_id = ?
      ORDER BY alias
      `,
            [id],
        ),

        db.select<ValueRow[]>(
            `
      SELECT target_title AS value
      FROM document_links
      WHERE source_document_id = ?
      ORDER BY target_title
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
      ORDER BY source.title
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

            /*
             * string → DocumentType
             */
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
    const db = await getDatabase();

    const rows = await db.select<
        { id: string }[]
    >(
        `
    SELECT DISTINCT d.id
    FROM documents d
    LEFT JOIN document_aliases a
      ON a.document_id = d.id
    WHERE
      LOWER(d.title) = LOWER(?)
      OR LOWER(a.alias) = LOWER(?)
    LIMIT 1
    `,
        [title, title],
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
        Math.min(limit, 50),
    );

    const rows = await db.select<DocumentRow[]>(`
    SELECT
      id,
      path,
      title,
      document_type,
      content,
      created_at,
      updated_at
    FROM documents
    ORDER BY updated_at DESC
    LIMIT ${safeLimit}
  `);

    return rows.map((row) => ({
        id: row.id,
        path: row.path,
        title: row.title,

        /*
         * string → DocumentType
         */
        documentType: normalizeDocumentType(
            row.document_type,
        ),

        createdAt: normalizeDate(row.created_at),
        updatedAt: normalizeDate(row.updated_at),
    }));
}