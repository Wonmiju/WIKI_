import { isTauri } from '@tauri-apps/api/core';
import Database from '@tauri-apps/plugin-sql';

let database: Database | null = null;

const DATABASE_URL =
    'mysql://root:root@127.0.0.1:3306/llm_wiki';

export async function getDatabase(): Promise<Database> {
    if (database) {
        return database;
    }

    if (!isTauri()) {
        throw new Error(
            '현재 페이지는 일반 브라우저에서 실행 중입니다. ' +
            'Tauri 데스크톱 앱 창을 사용하세요.',
        );
    }

    database = await Database.load(DATABASE_URL);

    return database;
}

interface ConnectionRow {
    database_name: string;
    server_version: string;
    document_count: number | string;
}

export async function testDatabaseConnection():
    Promise<ConnectionRow> {
    const db = await getDatabase();

    const rows = await db.select<ConnectionRow[]>(`
    SELECT
      DATABASE() AS database_name,
      VERSION() AS server_version,
      (SELECT COUNT(*) FROM documents) AS document_count
  `);

    const row = rows[0];

    if (!row) {
        throw new Error('MariaDB 응답이 없습니다.');
    }

    return {
        ...row,
        document_count: Number(row.document_count),
    };
}