import { useDocumentStore } from '../../stores/documentStore';
import { useSettingsStore } from '../../stores/settingsStore';
import styles from './Header.module.css';

export function Header() {
  const { currentDocument, searchQuery, setSearchQuery } = useDocumentStore();
  const { theme, toggleTheme, toggleSidebar, toggleRightPanel } =
    useSettingsStore();

  const pathParts = currentDocument?.path.split('/') ?? [];

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>W</span>
          LLM Wiki
        </div>
        {currentDocument && (
          <span className={styles.breadcrumb}>
            {pathParts.slice(0, -1).join(' / ')}
          </span>
        )}
      </div>

      <div className={styles.center}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="문서 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={toggleSidebar}
          title="사이드바 토글"
        >
          ☰
        </button>
        <button
          className={styles.iconBtn}
          onClick={toggleRightPanel}
          title="우측 패널 토글"
        >
          ⊞
        </button>
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  );
}
