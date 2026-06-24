import { findDocumentByTitle } from '../../data/mockDocuments';
import { useDocumentStore } from '../../stores/documentStore';
import styles from './WikiLink.module.css';

interface WikiLinkProps {
  title: string;
}

export function WikiLink({ title }: WikiLinkProps) {
  const openDocumentByTitle = useDocumentStore((s) => s.openDocumentByTitle);
  const exists = !!findDocumentByTitle(title);

  return (
    <a
      className={exists ? styles.wikiLink : styles.wikiLinkMissing}
      onClick={(e) => {
        e.preventDefault();
        if (exists) openDocumentByTitle(title);
      }}
      href="#"
      title={exists ? `Open ${title}` : `${title} (not found)`}
    >
      {title}
    </a>
  );
}
