import type { DocumentType } from '../../types/document';
import { useDocumentStore } from '../../stores/documentStore';
import { MarkdownViewer } from '../markdown/MarkdownViewer';
import styles from './MainContent.module.css';

const TYPE_CLASS: Record<DocumentType, string> = {
  model: styles.typeModel,
  module: styles.typeModule,
  dataset: styles.typeDataset,
  concept: styles.typeConcept,
  experiment: styles.typeExperiment,
  paper: styles.typePaper,
};

export function MainContent() {
  const { currentDocument, openDocumentByTitle } = useDocumentStore();

  if (!currentDocument) {
    return (
      <main className={styles.container}>
        <div className={styles.empty}>문서를 선택하세요</div>
      </main>
    );
  }

  const { frontmatter, content, outgoingLinks } = currentDocument;

  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{frontmatter.title}</h1>

        <div className={styles.meta}>
          <span className={`${styles.metaBadge} ${TYPE_CLASS[frontmatter.type]}`}>
            {frontmatter.type}
          </span>
          {frontmatter.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
          {frontmatter.updated && (
            <span className={styles.date}>Updated {frontmatter.updated}</span>
          )}
        </div>

        <MarkdownViewer content={content} />

        {outgoingLinks.length > 0 && (
          <div className={styles.outgoing}>
            <div className={styles.outgoingTitle}>Outgoing Links</div>
            <div className={styles.outgoingList}>
              {outgoingLinks.map((link) => (
                <span
                  key={link}
                  className={styles.outgoingLink}
                  onClick={() => openDocumentByTitle(link)}
                >
                  {link}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
