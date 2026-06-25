import Database from '@tauri-apps/plugin-sql';

let database: Database | null = null;

const DATABASE_URL =
    'mysql://root:root@127.0.0.1:3306/llm_wiki';

export async function getDatabase(): Promise<Database> {
    if (database) {
        return database;
    }

    database = await Database.load(DATABASE_URL);
    return database;
}

interface ConnectionRow {
    database_name: string;
    server_version: string;
    document_count: number;
}

export async function testDatabaseConnection(): Promise<ConnectionRow> {
    const db = await getDatabase();

    const rows = await db.select<ConnectionRow[]>(`
    SELECT
      DATABASE() AS database_name,
      VERSION() AS server_version,
      (SELECT COUNT(*) FROM documents) AS document_count
  `);

    if (!rows[0]) {
        throw new Error('MariaDB 응답이 없습니다.');
    }

    return rows[0];
}