import { useDocumentStore } from '../../stores/documentStore';
import styles from './Backlinks.module.css';

interface BacklinksProps {
  links: string[];
}

export function Backlinks({ links }: BacklinksProps) {
  const openDocumentByTitle = useDocumentStore((s) => s.openDocumentByTitle);

  if (links.length === 0) {
    return <div className={styles.empty}>백링크 없음</div>;
  }

  return (
    <div className={styles.list}>
      {links.map((link) => (
        <div
          key={link}
          className={styles.item}
          onClick={() => openDocumentByTitle(link)}
        >
          {link}
        </div>
      ))}
    </div>
  );
}
