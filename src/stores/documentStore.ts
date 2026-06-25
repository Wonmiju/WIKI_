import { create } from 'zustand';

import {
  findAllDocuments,
  findDocumentById,
  findDocumentByTitle,
  findRecentDocuments,
} from '../repositories/documentRepo';

import { findAllTags } from '../repositories/tagRepo';
import { buildLocalGraph } from '../repositories/graphRepo';
import { buildFileTree } from '../services/fileTreeBuilder';

import type {
  Document,
  DocumentSummary,
  FileTreeNode,
} from '../types/document';

import type { GraphData } from '../types/graph';

interface DocumentStore {
  documents: DocumentSummary[];
  selectedDocument: Document | null;
  fileTree: FileTreeNode[];
  tags: string[];
  recentDocuments: DocumentSummary[];
  localGraph: GraphData;

  loading: boolean;
  initialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  selectDocument: (id: string) => Promise<void>;
  openWikiLink: (title: string) => Promise<void>;
  selectDocumentByTitle: (title: string) => Promise<void>;
}

const EMPTY_GRAPH: GraphData = {
  nodes: [],
  edges: [],
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export const useDocumentStore = create<DocumentStore>(
  (set, get) => ({
    documents: [],
    selectedDocument: null,
    fileTree: [],
    tags: [],
    recentDocuments: [],
    localGraph: EMPTY_GRAPH,

    loading: false,
    initialized: false,
    error: null,

    initialize: async () => {
      console.log('[documentStore] initialize 시작');

      set({
        loading: true,
        error: null,
      });

      try {
        console.log(
          '[documentStore] 문서, 태그, 최근 문서 조회 시작',
        );

        const [
          documents,
          tags,
          recentDocuments,
        ] = await Promise.all([
          findAllDocuments(),
          findAllTags(),
          findRecentDocuments(5),
        ]);

        console.log('[documentStore] 기본 데이터 조회 성공', {
          documentCount: documents.length,
          tagCount: tags.length,
          recentDocumentCount: recentDocuments.length,
        });

        const fileTree = buildFileTree(documents);

        console.log('[documentStore] 파일 트리 생성 성공', {
          rootNodeCount: fileTree.length,
        });

        set({
          documents,
          fileTree,
          tags,
          recentDocuments,
          initialized: true,
          loading: false,
        });

        const current = get().selectedDocument;
        const firstDocument = documents[0];

        console.log('[documentStore] 초기 선택 문서 확인', {
          hasCurrentDocument: Boolean(current),
          firstDocumentId: firstDocument?.id ?? null,
        });

        if (!current && firstDocument) {
          console.log(
            '[documentStore] 첫 번째 문서 자동 선택',
            firstDocument.id,
          );

          await get().selectDocument(firstDocument.id);
        }

        console.log('[documentStore] initialize 완료');
      } catch (error) {
        console.error(
          '[documentStore] initialize 실패',
          error,
        );

        set({
          loading: false,
          initialized: false,
          error: getErrorMessage(error),
        });
      }
    },

    refresh: async () => {
      console.log('[documentStore] refresh 시작');

      await get().initialize();

      console.log('[documentStore] refresh 완료');
    },

    selectDocument: async (id: string) => {
      console.log(
        '[documentStore] selectDocument 시작',
        { id },
      );

      set({
        loading: true,
        error: null,
      });

      try {
        console.log(
          '[documentStore] 문서와 로컬 그래프 조회 시작',
          { id },
        );

        const [
          document,
          localGraph,
        ] = await Promise.all([
          findDocumentById(id),
          buildLocalGraph(id),
        ]);

        console.log(
          '[documentStore] 문서와 로컬 그래프 조회 결과',
          {
            documentFound: Boolean(document),
            graphNodeCount: localGraph.nodes.length,
            graphEdgeCount: localGraph.edges.length,
          },
        );

        if (!document) {
          throw new Error(
            `문서를 찾을 수 없습니다: ${id}`,
          );
        }

        set({
          selectedDocument: document,
          localGraph,
          loading: false,
        });

        console.log(
          '[documentStore] selectDocument 완료',
          {
            id: document.id,
            title: document.frontmatter.title,
          },
        );
      } catch (error) {
        console.error(
          '[documentStore] selectDocument 실패',
          {
            id,
            error,
          },
        );

        set({
          loading: false,
          error: getErrorMessage(error),
        });
      }
    },

    openWikiLink: async (title: string) => {
      console.log(
        '[documentStore] openWikiLink 시작',
        { title },
      );

      set({
        loading: true,
        error: null,
      });

      try {
        const document =
          await findDocumentByTitle(title);

        console.log(
          '[documentStore] 위키 링크 문서 조회 결과',
          {
            title,
            documentFound: Boolean(document),
          },
        );

        if (!document) {
          throw new Error(
            `연결된 문서가 없습니다: ${title}`,
          );
        }

        const localGraph =
          await buildLocalGraph(document.id);

        console.log(
          '[documentStore] 위키 링크 그래프 조회 성공',
          {
            documentId: document.id,
            graphNodeCount: localGraph.nodes.length,
            graphEdgeCount: localGraph.edges.length,
          },
        );

        set({
          selectedDocument: document,
          localGraph,
          loading: false,
        });

        console.log(
          '[documentStore] openWikiLink 완료',
          {
            id: document.id,
            title: document.frontmatter.title,
          },
        );
      } catch (error) {
        console.error(
          '[documentStore] openWikiLink 실패',
          {
            title,
            error,
          },
        );

        set({
          loading: false,
          error: getErrorMessage(error),
        });
      }
    },

    selectDocumentByTitle: async (
      title: string,
    ) => {
      console.log(
        '[documentStore] selectDocumentByTitle 시작',
        { title },
      );

      set({
        loading: true,
        error: null,
      });

      try {
        const document =
          await findDocumentByTitle(title);

        console.log(
          '[documentStore] 제목 기반 문서 조회 결과',
          {
            title,
            documentFound: Boolean(document),
          },
        );

        if (!document) {
          throw new Error(
            `문서를 찾을 수 없습니다: ${title}`,
          );
        }

        const localGraph =
          await buildLocalGraph(document.id);

        console.log(
          '[documentStore] 제목 기반 그래프 조회 성공',
          {
            documentId: document.id,
            graphNodeCount: localGraph.nodes.length,
            graphEdgeCount: localGraph.edges.length,
          },
        );

        set({
          selectedDocument: document,
          localGraph,
          loading: false,
        });

        console.log(
          '[documentStore] selectDocumentByTitle 완료',
          {
            id: document.id,
            title: document.frontmatter.title,
          },
        );
      } catch (error) {
        console.error(
          '[documentStore] selectDocumentByTitle 실패',
          {
            title,
            error,
          },
        );

        set({
          loading: false,
          error: getErrorMessage(error),
        });
      }
    },
  }),
);