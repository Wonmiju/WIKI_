import type { DocumentFrontmatter } from '../../types/document';
import styles from './PropertiesPanel.module.css';

interface PropertiesPanelProps {
  frontmatter: DocumentFrontmatter;
  path: string;
}

export function PropertiesPanel({ frontmatter, path }: PropertiesPanelProps) {
  return (
    <div className={styles.list}>
      <div className={styles.row}>
        <span className={styles.label}>ID</span>
        <span className={styles.value}>{frontmatter.id}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Type</span>
        <span className={styles.value}>{frontmatter.type}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Path</span>
        <span className={styles.value}>{path}</span>
      </div>
      {frontmatter.created && (
        <div className={styles.row}>
          <span className={styles.label}>Created</span>
          <span className={styles.value}>{frontmatter.created}</span>
        </div>
      )}
      {frontmatter.updated && (
        <div className={styles.row}>
          <span className={styles.label}>Updated</span>
          <span className={styles.value}>{frontmatter.updated}</span>
        </div>
      )}
      {frontmatter.tags.length > 0 && (
        <div className={styles.row}>
          <span className={styles.label}>Tags</span>
          <div className={styles.tagList}>
            {frontmatter.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
