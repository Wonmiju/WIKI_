import { ALL_TAGS, FILE_TREE, RECENT_DOCUMENTS } from '../../data/mockDocuments';
import { FileTree } from '../navigation/FileTree';
import { TagList } from '../navigation/TagList';
import { RecentDocuments } from '../navigation/RecentDocuments';
import styles from './Sidebar.module.css';

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.workspace}>
        <select className={styles.workspaceSelect} defaultValue="knowledge-vault">
          <option value="knowledge-vault">knowledge-vault</option>
          <option value="research-notes" disabled>
            research-notes (Phase 2)
          </option>
        </select>
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Explorer</div>
          <FileTree nodes={FILE_TREE} />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>Tags</div>
          <TagList tags={ALL_TAGS} />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>Recent</div>
          <RecentDocuments items={RECENT_DOCUMENTS} />
        </div>
      </div>
    </aside>
  );
}
