export const DOCUMENT_TYPES = [
  'model',
  'module',
  'dataset',
  'concept',
  'experiment',
  'paper',
] as const;

export type DocumentType =
  (typeof DOCUMENT_TYPES)[number];

/**
 * 외부 문자열이 유효한 DocumentType인지 검사한다.
 *
 * MariaDB에서 조회한 document_type은 런타임 문자열이므로
 * 애플리케이션 타입으로 사용하기 전에 검증해야 한다.
 */
export function isDocumentType(
  value: unknown,
): value is DocumentType {
  return (
    typeof value === 'string' &&
    DOCUMENT_TYPES.includes(value as DocumentType)
  );
}

/**
 * DB 문자열을 DocumentType으로 변환한다.
 *
 * 잘못된 타입이 저장되어 있으면 concept를 기본값으로 사용한다.
 * 엄격하게 처리하려면 여기서 Error를 throw해도 된다.
 */
export function normalizeDocumentType(
  value: unknown,
): DocumentType {
  if (isDocumentType(value)) {
    return value;
  }

  console.warn(
    `지원하지 않는 document type입니다: ${String(value)}. ` +
    '"concept"로 대체합니다.',
  );

  return 'concept';
}

export interface DocumentFrontmatter {
  id: string;
  title: string;
  type: DocumentType;
  tags: string[];
  aliases?: string[];
  created: string;
  updated: string;
}

export interface Document {
  id: string;
  path: string;
  frontmatter: DocumentFrontmatter;
  outgoingLinks: string[];
  backlinks: string[];
  content: string;
}

export interface DocumentSummary {
  id: string;
  path: string;
  title: string;
  documentType: DocumentType;
  createdAt: string;
  updatedAt: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  documentId?: string;
  children?: FileTreeNode[];
}