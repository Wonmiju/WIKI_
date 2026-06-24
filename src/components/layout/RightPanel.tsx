import { useMemo } from 'react';
import { useDocumentStore } from '../../stores/documentStore';
import { LocalGraph } from '../graph/LocalGraph';
import { Backlinks } from '../properties/Backlinks';
import { PropertiesPanel } from '../properties/PropertiesPanel';
import styles from './RightPanel.module.css';

function extractHeadings(content: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      headings.push({ level: match[1].length, text: match[2] });
    }
  }
  return headings;
}

export function RightPanel() {
  const { currentDocument, localGraph } = useDocumentStore();

  const headings = useMemo(
    () => (currentDocument ? extractHeadings(currentDocument.content) : []),
    [currentDocument],
  );

  if (!currentDocument) {
    return (
      <aside className={styles.panel}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Graph</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            문서를 선택하면 그래프가 표시됩니다
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.scrollArea}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Local Graph</div>
          <LocalGraph
            data={localGraph}
            currentNodeId={currentDocument.id}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Links to This Page</div>
          <Backlinks links={currentDocument.backlinks} />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Properties</div>
          <PropertiesPanel
            frontmatter={currentDocument.frontmatter}
            path={currentDocument.path}
          />
        </div>

        {headings.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Table of Contents</div>
            <div className={styles.toc}>
              {headings.map((h, i) => (
                <div
                  key={i}
                  className={`${styles.tocItem} ${
                    h.level === 2 ? styles.tocH2 : h.level === 3 ? styles.tocH3 : ''
                  }`}
                >
                  {h.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
