import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { Core, ElementDefinition } from 'cytoscape';

import type { GraphData } from '../../types/graph';
import type { DocumentType } from '../../types/document';

import { useDocumentStore } from '../../stores/documentStore';

import styles from './LocalGraph.module.css';

const NODE_COLORS: Record<DocumentType | 'tag', string> = {
  model: 'var(--graph-node-model)',
  module: 'var(--graph-node-module)',
  dataset: 'var(--graph-node-dataset)',
  concept: 'var(--graph-node-concept)',
  experiment: 'var(--graph-node-experiment)',
  paper: 'var(--graph-node-paper)',
  tag: 'var(--text-muted)',
};

/**
 * localGraph가 아직 초기화되지 않았을 때 사용할 빈 그래프
 */
const EMPTY_GRAPH: GraphData = {
  nodes: [],
  edges: [],
};

/**
 * CSS 변수로 지정된 색상을 Cytoscape에서 사용할 수 있는
 * 실제 RGB 색상 문자열로 변환한다.
 */
function getNodeColor(type: DocumentType | 'tag'): string {
  const element = document.createElement('div');

  element.style.color =
    NODE_COLORS[type] ?? NODE_COLORS.concept;

  document.body.appendChild(element);

  const color = getComputedStyle(element).color;

  document.body.removeChild(element);

  return color;
}

export function LocalGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  /**
   * MariaDB 또는 documentStore에서 생성된 동적 그래프 데이터
   */
  const graphData = useDocumentStore(
    (state) => state.localGraph ?? EMPTY_GRAPH,
  );

  /**
   * 그래프 노드를 클릭했을 때 문서를 선택하는 Store 액션
   */
  const selectDocument = useDocumentStore(
    (state) => state.selectDocument,
  );

  const selectedDocumentId = useDocumentStore(
    (state) => state.selectedDocument?.id,
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    /**
     * Store의 GraphData를 Cytoscape elements 형식으로 변환
     */
    const elements: ElementDefinition[] = [
      ...graphData.nodes.map((node) => ({
        group: 'nodes' as const,

        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          color: getNodeColor(node.type),
        },
      })),

      ...graphData.edges.map((edge, index) => ({
        group: 'edges' as const,

        data: {
          id: `${edge.source}-${edge.target}-${index}`,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        },
      })),
    ];

    /**
     * 기존 Cytoscape 인스턴스 정리
     *
     * localGraph가 변경될 때 새로운 그래프를 생성하기 위함
     */
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    const cy = cytoscape({
      container,
      elements,

      style: [
        {
          selector: 'node',

          style: {
            label: 'data(label)',
            'background-color': 'data(color)',

            color: '#ccc',
            'font-size': '10px',
            'font-weight': 'normal',

            'text-valign': 'bottom',
            'text-margin-y': 4,

            width: 24,
            height: 24,

            'border-width': 2,
            'border-color': 'transparent',
          },
        },

        {
          selector: 'node.highlight',

          style: {
            width: 32,
            height: 32,

            'border-color': '#4fc1ff',
            'border-width': 3,

            'font-weight': 'bold',
            'font-size': '11px',
          },
        },

        {
          selector: 'edge',

          style: {
            width: 1.5,

            'line-color': '#555',
            'target-arrow-color': '#555',
            'target-arrow-shape': 'triangle',

            'curve-style': 'bezier',

            opacity: 0.7,
          },
        },
      ],

      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 300,

        nodeRepulsion: 8000,
        idealEdgeLength: 60,

        padding: 20,
      },

      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    /**
     * 현재 선택된 문서 노드 강조
     */
    if (selectedDocumentId) {
      const selectedNode = cy.getElementById(selectedDocumentId);

      if (!selectedNode.empty()) {
        selectedNode.addClass('highlight');
      }
    }

    /**
     * 노드 클릭 시 documentStore 상태 변경
     */
    cy.on('tap', 'node', (event) => {
      const documentId = event.target.id();

      if (documentId === selectedDocumentId) {
        return;
      }

      void selectDocument(documentId);
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();

      if (cyRef.current === cy) {
        cyRef.current = null;
      }
    };
  }, [
    graphData,
    selectedDocumentId,
    selectDocument,
  ]);

  return (
    <div className={styles.wrapper}>
      {graphData.nodes.length === 0 ? (
        <div className={styles.empty}>
          표시할 그래프 데이터가 없습니다.
        </div>
      ) : (
        <div
          ref={containerRef}
          className={styles.graph}
        />
      )}
    </div>
  );
}