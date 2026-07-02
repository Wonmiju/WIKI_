import {
  useEffect,
  useMemo,
  useRef,
} from 'react';

import cytoscape, {
  type Core,
  type ElementDefinition,
  type Layouts,
} from 'cytoscape';

import { useDocumentStore } from '../../stores/documentStore';

import styles from './LocalGraph.module.css';

export function LocalGraph() {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const cytoscapeRef =
    useRef<Core | null>(null);

  const layoutRef =
    useRef<Layouts | null>(null);

  const resizeFrameRef =
    useRef<number | null>(null);

  const localGraph = useDocumentStore(
    (state) => state.localGraph,
  );

  const selectedDocumentId = useDocumentStore(
    (state) => state.selectedDocument?.id,
  );

  const selectDocument = useDocumentStore(
    (state) => state.selectDocument,
  );

  const elements = useMemo<ElementDefinition[]>(
    () => {
      const nodeElements: ElementDefinition[] =
        localGraph.nodes.map((node) => ({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            isCenter:
              node.id === selectedDocumentId
                ? 'true'
                : 'false',
          },
        }));

      const edgeElements: ElementDefinition[] =
        localGraph.edges.map(
          (edge, index) => ({
            data: {
              id: [
                edge.source,
                edge.target,
                edge.type,
                index,
              ].join('::'),

              source: edge.source,
              target: edge.target,
              type: edge.type,
            },
          }),
        );

      return [
        ...nodeElements,
        ...edgeElements,
      ];
    },
    [
      localGraph.nodes,
      localGraph.edges,
      selectedDocumentId,
    ],
  );

  /*
   * Cytoscape 인스턴스는 컴포넌트 생명주기 동안
   * 한 번만 생성한다.
   */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const cy = cytoscape({
      container,

      elements: [],

      minZoom: 0.35,
      maxZoom: 2.5,

      wheelSensitivity: 0.2,

      style: [
        {
          selector: 'node',
          style: {
            width: 32,
            height: 32,

            label: 'data(label)',

            color: '#d4d4d8',
            'font-size': 10,

            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,

            'background-color': '#52525b',

            'border-width': 2,
            'border-color': '#71717a',

            'overlay-opacity': 0,
          },
        },

        {
          selector: 'node[isCenter = "true"]',
          style: {
            width: 44,
            height: 44,

            'background-color': '#2563eb',

            'border-width': 4,
            'border-color': '#60a5fa',

            color: '#f4f4f5',
            'font-weight': 700,
          },
        },

        {
          selector: 'node[type = "tag"]',
          style: {
            width: 24,
            height: 24,

            'background-color': '#7c3aed',

            'border-width': 2,
            'border-color': '#a78bfa',
          },
        },

        {
          selector: 'edge',
          style: {
            width: 1.6,

            'curve-style': 'bezier',

            'line-color': '#52525b',

            'target-arrow-color': '#71717a',
            'target-arrow-shape': 'triangle',

            opacity: 0.85,

            'arrow-scale': 0.8,
          },
        },

        {
          selector: 'edge[type = "tag"]',
          style: {
            'line-color': '#6d28d9',
            'target-arrow-color': '#8b5cf6',
            'line-style': 'dashed',
          },
        },

        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#f59e0b',
          },
        },
      ],
    });

    cytoscapeRef.current = cy;

    const handleNodeTap = (
      event: cytoscape.EventObject,
    ) => {
      const node = event.target;

      const nodeId = node.id();
      const nodeType = String(
        node.data('type') ?? '',
      );

      if (
        nodeType === 'tag' ||
        nodeId === selectedDocumentId
      ) {
        return;
      }

      void selectDocument(nodeId);
    };

    cy.on(
      'tap',
      'node',
      handleNodeTap,
    );

    const resizeObserver =
      new ResizeObserver(() => {
        if (resizeFrameRef.current !== null) {
          window.cancelAnimationFrame(
            resizeFrameRef.current,
          );
        }

        resizeFrameRef.current =
          window.requestAnimationFrame(() => {
            const currentCy =
              cytoscapeRef.current;

            if (
              !currentCy ||
              currentCy.destroyed()
            ) {
              return;
            }

            const rect =
              container.getBoundingClientRect();

            if (
              rect.width <= 0 ||
              rect.height <= 0
            ) {
              return;
            }

            currentCy.resize();

            if (
              currentCy.elements().length > 0
            ) {
              currentCy.fit(
                currentCy.elements(),
                28,
              );
            }
          });
      });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();

      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(
          resizeFrameRef.current,
        );

        resizeFrameRef.current = null;
      }

      cy.off(
        'tap',
        'node',
        handleNodeTap,
      );

      /*
       * 실행 중인 layout과 element animation을 먼저 중지한다.
       */
      layoutRef.current?.stop();
      layoutRef.current = null;

      cy.elements().stop(
        true,
        false,
      );

      if (!cy.destroyed()) {
        cy.destroy();
      }

      cytoscapeRef.current = null;
    };
  }, [
    selectDocument,
    selectedDocumentId,
  ]);

  /*
   * 그래프 데이터가 변경될 때 Cytoscape 인스턴스를
   * 파괴하지 않고 elements만 갱신한다.
   */
  useEffect(() => {
    const cy = cytoscapeRef.current;

    if (!cy || cy.destroyed()) {
      return;
    }

    layoutRef.current?.stop();
    layoutRef.current = null;

    cy.elements().stop(
      true,
      false,
    );

    cy.batch(() => {
      cy.elements().remove();

      if (elements.length > 0) {
        cy.add(elements);
      }
    });

    if (elements.length === 0) {
      return;
    }

    const layout = cy.layout({
      name: 'cose',

      animate: false,
      fit: true,
      padding: 32,

      nodeRepulsion: 9000,
      idealEdgeLength: 100,
      edgeElasticity: 120,

      gravity: 0.25,

      randomize: true,
    });

    layoutRef.current = layout;

    layout.one('layoutstop', () => {
      const currentCy =
        cytoscapeRef.current;

      if (
        !currentCy ||
        currentCy.destroyed()
      ) {
        return;
      }

      currentCy.resize();
      currentCy.fit(
        currentCy.elements(),
        32,
      );
    });

    layout.run();

    return () => {
      layout.stop();

      if (layoutRef.current === layout) {
        layoutRef.current = null;
      }
    };
  }, [elements]);

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h2>로컬 그래프</h2>

          <p>
            {localGraph.nodes.length} Nodes ·{' '}
            {localGraph.edges.length} Edges
          </p>
        </div>
      </header>

      <div className={styles.graphArea}>
        {localGraph.nodes.length === 0 && (
          <div className={styles.empty}>
            <strong>
              연결된 그래프가 없습니다.
            </strong>

            <span>
              document_links와 document_tags 관계를
              확인하세요.
            </span>
          </div>
        )}

        <div
          ref={containerRef}
          className={styles.graph}
        />
      </div>
    </section>
  );
}