import { create } from 'zustand';
import type { Document } from '../types/document';
import type { GraphData } from '../types/graph';
import {
  buildLocalGraph,
  findDocumentById,
  findDocumentByTitle,
  MOCK_DOCUMENTS,
} from '../data/mockDocuments';

interface DocumentState {
  currentDocument: Document | null;
  localGraph: GraphData;
  searchQuery: string;
  openDocument: (id: string) => void;
  openDocumentByTitle: (title: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  currentDocument: MOCK_DOCUMENTS['model-rtdetr'],
  localGraph: buildLocalGraph('model-rtdetr'),
  searchQuery: '',

  openDocument: (id) => {
    const doc = findDocumentById(id);
    if (doc) {
      set({
        currentDocument: doc,
        localGraph: buildLocalGraph(id),
      });
    }
  },

  openDocumentByTitle: (title) => {
    const doc = findDocumentByTitle(title);
    if (doc) {
      set({
        currentDocument: doc,
        localGraph: buildLocalGraph(doc.id),
      });
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
