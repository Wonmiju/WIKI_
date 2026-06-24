import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { Core } from 'cytoscape';
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

function getNodeColor(type: DocumentType | 'tag'): string {
  const el = document.createElement('div');
  el.style.color = NODE_COLORS[type] ?? NODE_COLORS.concept;
  document.body.appendChild(el);
  const color = getComputedStyle(el).color;
  document.body.removeChild(el);
  return color;
}

interface LocalGraphProps {
  data: GraphData;
  currentNodeId?: string;
}

export function LocalGraph({ data, currentNodeId }: LocalGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const openDocument = useDocumentStore((s) => s.openDocument);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [
      ...data.nodes.map((n) => ({
        group: 'nodes' as const,
        data: {
          id: n.id,
          label: n.label,
          type: n.type,
          color: getNodeColor(n.type),
        },
      })),
      ...data.edges.map((e, i) => ({
        group: 'edges' as const,
        data: {
          id: `e-${i}`,
          source: e.source,
          target: e.target,
        },
      })),
    ];

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': 'data(color)',
            color: '#ccc',
            'font-size': '10px',
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

    if (currentNodeId) {
      cy.getElementById(currentNodeId).addClass('highlight');
    }

    cy.on('tap', 'node', (evt) => {
      const id = evt.target.id();
      if (id !== currentNodeId) {
        openDocument(id);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [data, currentNodeId, openDocument]);

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.graph} />
    </div>
  );
}
