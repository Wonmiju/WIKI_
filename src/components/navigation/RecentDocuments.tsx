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
  const selectDocument = useDocumentStore(
    (state) => state.selectDocument,
  );

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div
          key={item.id}
          className={styles.item}
          onClick={() => void selectDocument(item.id)}
        >
          <span className={styles.icon}>🕐</span>
          <span className={styles.title}>{item.title}</span>
        </div>
      ))}
    </div>
  );
}
