import { useDocumentStore } from '../../stores/documentStore';
import styles from './RecentDocuments.module.css';

interface RecentItem {
  id: string;
  title: string;
  path: string;
}

interface RecentDocumentsProps {
  items: RecentItem[];
}

export function RecentDocuments({ items }: RecentDocumentsProps) {
  const openDocument = useDocumentStore((s) => s.openDocument);

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div
          key={item.id}
          className={styles.item}
          onClick={() => openDocument(item.id)}
        >
          <span className={styles.icon}>🕐</span>
          <span className={styles.title}>{item.title}</span>
        </div>
      ))}
    </div>
  );
}
