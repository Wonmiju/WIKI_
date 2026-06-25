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
      set({
        loading: true,
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

        const fileTree = buildFileTree(documents);

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

        if (!current && firstDocument) {
          await get().selectDocument(firstDocument.id);
        }
      } catch (error) {
        console.error(error);

        set({
          loading: false,
          initialized: false,
          error: getErrorMessage(error),
        });
      }
    },

    refresh: async () => {
      await get().initialize();
    },

    selectDocument: async (id: string) => {
      set({
        loading: true,
        error: null,
      });

      try {
        const [
          document,
          localGraph,
        ] = await Promise.all([
          findDocumentById(id),
          buildLocalGraph(id),
        ]);

        if (!document) {
          throw new Error(`문서를 찾을 수 없습니다: ${id}`);
        }

        set({
          selectedDocument: document,
          localGraph,
          loading: false,
        });
      } catch (error) {
        set({
          loading: false,
          error: getErrorMessage(error),
        });
      }
    },

    openWikiLink: async (title: string) => {
      set({
        loading: true,
        error: null,
      });

      try {
        const document = await findDocumentByTitle(title);

        if (!document) {
          throw new Error(
            `연결된 문서가 없습니다: ${title}`,
          );
        }

        const localGraph =
          await buildLocalGraph(document.id);

        set({
          selectedDocument: document,
          localGraph,
          loading: false,
        });
      } catch (error) {
        set({
          loading: false,
          error: getErrorMessage(error),
        });
      }
    },
  }),
);