import { useCallback, useEffect, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { RightPanel } from './components/layout/RightPanel';
import { useSettingsStore } from './stores/settingsStore';
import styles from './styles/App.module.css';

// MariaDB 연결
import { testDatabaseConnection } from './database/db';

export default function App() {
  useEffect(() => {
    async function connectDatabase(): Promise<void> {
      try {
        await testDatabaseConnection();
        console.log('MariaDB 연결 성공');
      } catch (error) {
        console.error('MariaDB 연결 실패:', error);
      }
    }

    void connectDatabase();
  }, []);

  const {
    theme,
    sidebarWidth,
    rightPanelWidth,
    sidebarCollapsed,
    rightPanelCollapsed,
    setSidebarWidth,
    setRightPanelWidth,
    toggleSidebar,
    toggleRightPanel,
  } = useSettingsStore();

  const draggingRef = useRef<'left' | 'right' | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggingRef.current === 'left') {
        setSidebarWidth(Math.max(180, Math.min(400, e.clientX)));
      } else if (draggingRef.current === 'right') {
        setRightPanelWidth(
          Math.max(200, Math.min(450, window.innerWidth - e.clientX)),
        );
      }
    },
    [setSidebarWidth, setRightPanelWidth],
  );

  const handleMouseUp = useCallback(() => {
    draggingRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const startDrag = (side: 'left' | 'right') => {
    draggingRef.current = side;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className={styles.app}>
      <Header />

      <div className={styles.main}>
        {sidebarCollapsed ? (
          <div className={styles.collapsedBar}>
            <button
              className={styles.expandBtn}
              onClick={toggleSidebar}
              title="사이드바 열기"
            >
              ☰
            </button>
          </div>
        ) : (
          <>
            <div style={{ width: sidebarWidth, flexShrink: 0, display: 'flex' }}>
              <Sidebar />
            </div>
            <div
              className={styles.resizeHandle}
              onMouseDown={() => startDrag('left')}
            />
          </>
        )}

        <MainContent />

        {rightPanelCollapsed ? (
          <div className={`${styles.collapsedBar} ${styles.collapsedBarRight}`}>
            <button
              className={styles.expandBtn}
              onClick={toggleRightPanel}
              title="우측 패널 열기"
            >
              ⊞
            </button>
          </div>
        ) : (
          <>
            <div
              className={styles.resizeHandle}
              onMouseDown={() => startDrag('right')}
            />
            <div style={{ width: rightPanelWidth, flexShrink: 0, display: 'flex' }}>
              <RightPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
