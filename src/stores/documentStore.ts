import { create } from 'zustand';

import {
  findAllDocuments,
  findDocumentById,
  findDocumentByTitle,
  findRecentDocuments,
  updateDocumentContent,
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
  initializing: boolean;
  initialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  refresh: () => Promise<void>;

  selectDocument: (
    id: string,
  ) => Promise<void>;

  openWikiLink: (
    title: string,
  ) => Promise<void>;

  selectDocumentByTitle: (
    title: string,
  ) => Promise<void>;

  updateSelectedDocumentContent: (
    content: string,
  ) => Promise<void>;
}

const EMPTY_GRAPH: GraphData = {
  nodes: [],
  edges: [],
};

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function createDocumentSummary(
  document: Document,
): DocumentSummary {
  return {
    id: document.id,
    path: document.path,
    title: document.frontmatter.title,
    documentType:
      document.frontmatter.type,
    createdAt:
      document.frontmatter.created,
    updatedAt:
      document.frontmatter.updated,
  };
}

export const useDocumentStore =
  create<DocumentStore>((set, get) => ({
    documents: [],
    selectedDocument: null,
    fileTree: [],
    tags: [],
    recentDocuments: [],
    localGraph: EMPTY_GRAPH,

    loading: false,
    initializing: false,
    initialized: false,
    error: null,

    initialize: async () => {
      const {
        initialized,
        initializing,
      } = get();

      if (initialized) {
        console.log(
          '[documentStore] 이미 초기화되어 건너뜀',
        );
        return;
      }

      if (initializing) {
        console.log(
          '[documentStore] 초기화 진행 중이므로 중복 호출 건너뜀',
        );
        return;
      }

      console.log(
        '[documentStore] initialize 시작',
      );

      set({
        loading: true,
        initializing: true,
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

        console.log(
          '[documentStore] 기본 데이터 조회 성공',
          {
            documentCount:
              documents.length,
            tagCount:
              tags.length,
            recentDocumentCount:
              recentDocuments.length,
          },
        );

        const fileTree =
          buildFileTree(documents);

        console.log(
          '[documentStore] 파일 트리 생성 성공',
          {
            rootNodeCount:
              fileTree.length,
          },
        );

        set({
          documents,
          fileTree,
          tags,
          recentDocuments,

          initializing: false,
          initialized: true,
          loading: false,
          error: null,
        });

        const current =
          get().selectedDocument;

        const firstDocument =
          documents[0];

        console.log(
          '[documentStore] 초기 선택 문서 확인',
          {
            hasCurrentDocument:
              Boolean(current),
            firstDocumentId:
              firstDocument?.id ?? null,
          },
        );

        if (
          !current &&
          firstDocument
        ) {
          console.log(
            '[documentStore] 첫 번째 문서 자동 선택',
            firstDocument.id,
          );

          await get().selectDocument(
            firstDocument.id,
          );
        }

        console.log(
          '[documentStore] initialize 완료',
        );
      } catch (error) {
        console.error(
          '[documentStore] initialize 실패',
          error,
        );

        set({
          loading: false,
          initializing: false,
          initialized: false,
          error:
            getErrorMessage(error),
        });
      }
    },

    refresh: async () => {
      if (get().initializing) {
        return;
      }

      console.log(
        '[documentStore] refresh 시작',
      );

      const selectedDocumentId =
        get().selectedDocument?.id ?? null;

      set({
        loading: true,
        initializing: true,
        error: null,
      });

      try {
        const [
          documents,
          tags,
          recentDocuments,
        ] = await Promise.all([
          findAllDocuments(),
          findAllTags(),
          findRecentDocuments(5),
        ]);

        const fileTree =
          buildFileTree(documents);

        set({
          documents,
          fileTree,
          tags,
          recentDocuments,

          loading: false,
          initializing: false,
          initialized: true,
          error: null,
        });

        const targetDocumentId =
          selectedDocumentId &&
            documents.some(
              (document) =>
                document.id ===
                selectedDocumentId,
            )
            ? selectedDocumentId
            : documents[0]?.id;

        if (targetDocumentId) {
          await get().selectDocument(
            targetDocumentId,
          );
        } else {
          set({
            selectedDocument: null,
            localGraph: EMPTY_GRAPH,
          });
        }

        console.log(
          '[documentStore] refresh 완료',
        );
      } catch (error) {
        console.error(
          '[documentStore] refresh 실패',
          error,
        );

        set({
          loading: false,
          initializing: false,
          error:
            getErrorMessage(error),
        });
      }
    },

    selectDocument: async (
      id: string,
    ) => {
      const normalizedId = id.trim();

      if (!normalizedId) {
        set({
          error:
            '선택할 문서 ID가 비어 있습니다.',
        });
        return;
      }

      console.log(
        '[documentStore] selectDocument 시작',
        {
          id: normalizedId,
        },
      );

      set({
        loading: true,
        error: null,
      });

      try {
        console.log(
          '[documentStore] 문서와 로컬 그래프 조회 시작',
          {
            id: normalizedId,
          },
        );

        const [
          document,
          localGraph,
        ] = await Promise.all([
          findDocumentById(
            normalizedId,
          ),
          buildLocalGraph(
            normalizedId,
          ),
        ]);

        console.log(
          '[documentStore] 문서와 로컬 그래프 조회 결과',
          {
            documentFound:
              Boolean(document),
            graphNodeCount:
              localGraph.nodes.length,
            graphEdgeCount:
              localGraph.edges.length,
          },
        );

        if (!document) {
          throw new Error(
            `문서를 찾을 수 없습니다: ${normalizedId}`,
          );
        }

        set({
          selectedDocument:
            document,
          localGraph,
          loading: false,
          error: null,
        });

        console.log(
          '[documentStore] selectDocument 완료',
          {
            id: document.id,
            title:
              document.frontmatter
                .title,
          },
        );
      } catch (error) {
        console.error(
          '[documentStore] selectDocument 실패',
          {
            id: normalizedId,
            error,
          },
        );

        set({
          loading: false,
          error:
            getErrorMessage(error),
        });
      }
    },

    openWikiLink: async (
      title: string,
    ) => {
      const normalizedTitle =
        title.trim();

      if (!normalizedTitle) {
        set({
          error:
            '열려는 위키 링크 제목이 비어 있습니다.',
        });
        return;
      }

      console.log(
        '[documentStore] openWikiLink 시작',
        {
          title:
            normalizedTitle,
        },
      );

      set({
        loading: true,
        error: null,
      });

      try {
        const document =
          await findDocumentByTitle(
            normalizedTitle,
          );

        console.log(
          '[documentStore] 위키 링크 문서 조회 결과',
          {
            title:
              normalizedTitle,
            documentFound:
              Boolean(document),
          },
        );

        if (!document) {
          throw new Error(
            `연결된 문서가 없습니다: ${normalizedTitle}`,
          );
        }

        const localGraph =
          await buildLocalGraph(
            document.id,
          );

        set({
          selectedDocument:
            document,
          localGraph,
          loading: false,
          error: null,
        });

        console.log(
          '[documentStore] openWikiLink 완료',
          {
            id: document.id,
            title:
              document.frontmatter
                .title,
            graphNodeCount:
              localGraph.nodes.length,
            graphEdgeCount:
              localGraph.edges.length,
          },
        );
      } catch (error) {
        console.error(
          '[documentStore] openWikiLink 실패',
          {
            title:
              normalizedTitle,
            error,
          },
        );

        set({
          loading: false,
          error:
            getErrorMessage(error),
        });
      }
    },

    selectDocumentByTitle: async (
      title: string,
    ) => {
      const normalizedTitle =
        title.trim();

      if (!normalizedTitle) {
        set({
          error:
            '선택할 문서 제목이 비어 있습니다.',
        });
        return;
      }

      console.log(
        '[documentStore] selectDocumentByTitle 시작',
        {
          title:
            normalizedTitle,
        },
      );

      set({
        loading: true,
        error: null,
      });

      try {
        const document =
          await findDocumentByTitle(
            normalizedTitle,
          );

        console.log(
          '[documentStore] 제목 기반 문서 조회 결과',
          {
            title:
              normalizedTitle,
            documentFound:
              Boolean(document),
          },
        );

        if (!document) {
          throw new Error(
            `문서를 찾을 수 없습니다: ${normalizedTitle}`,
          );
        }

        const localGraph =
          await buildLocalGraph(
            document.id,
          );

        set({
          selectedDocument:
            document,
          localGraph,
          loading: false,
          error: null,
        });

        console.log(
          '[documentStore] selectDocumentByTitle 완료',
          {
            id: document.id,
            title:
              document.frontmatter
                .title,
            graphNodeCount:
              localGraph.nodes.length,
            graphEdgeCount:
              localGraph.edges.length,
          },
        );
      } catch (error) {
        console.error(
          '[documentStore] selectDocumentByTitle 실패',
          {
            title:
              normalizedTitle,
            error,
          },
        );

        set({
          loading: false,
          error:
            getErrorMessage(error),
        });
      }
    },

    updateSelectedDocumentContent:
      async (
        content: string,
      ) => {
        const selectedDocument =
          get().selectedDocument;

        if (!selectedDocument) {
          throw new Error(
            '수정할 문서가 선택되지 않았습니다.',
          );
        }

        if (
          content ===
          selectedDocument.content
        ) {
          return;
        }

        console.log(
          '[documentStore] 문서 본문 저장 시작',
          {
            id:
              selectedDocument.id,
          },
        );

        /*
         * App 전체 로딩 화면으로 전환되지 않도록
         * loading은 true로 변경하지 않는다.
         *
         * 저장 중 표시는 MainContent의 로컬 saving 상태로
         * 처리한다.
         */
        set({
          error: null,
        });

        try {
          const updatedDocument =
            await updateDocumentContent(
              selectedDocument.id,
              content,
            );

          const [
            localGraph,
            recentDocuments,
          ] = await Promise.all([
            buildLocalGraph(
              updatedDocument.id,
            ),
            findRecentDocuments(5),
          ]);

          const updatedSummary =
            createDocumentSummary(
              updatedDocument,
            );

          set((state) => ({
            selectedDocument:
              updatedDocument,

            localGraph,

            documents:
              state.documents.map(
                (document) =>
                  document.id ===
                    updatedDocument.id
                    ? updatedSummary
                    : document,
              ),

            recentDocuments,

            error: null,
          }));

          console.log(
            '[documentStore] 문서 본문 저장 완료',
            {
              id:
                updatedDocument.id,
              updatedAt:
                updatedDocument
                  .frontmatter
                  .updated,
            },
          );
        } catch (error) {
          console.error(
            '[documentStore] 문서 본문 저장 실패',
            {
              id:
                selectedDocument.id,
              error,
            },
          );

          const message =
            getErrorMessage(error);

          set({
            error: message,
          });

          /*
           * MainContent에서도 저장 실패를 표시할 수 있도록
           * 호출자에게 오류를 다시 전달한다.
           */
          throw error;
        }
      },
  }));