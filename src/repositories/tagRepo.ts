import { getDatabase } from '../database/db';

interface TagRow {
    name: string;
}

export async function findAllTags(): Promise<string[]> {
    const db = await getDatabase();

    const rows = await db.select<TagRow[]>(`
    SELECT name
    FROM tags
    ORDER BY name ASC
  `);

    return rows.map((row) => row.name);
}