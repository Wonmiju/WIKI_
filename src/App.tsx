import { useEffect } from 'react';
import { isTauri } from '@tauri-apps/api/core';

import Sidebar from './components/layout/Sidebar';
import { MainContent } from './components/layout/MainContent';
import { RightPanel } from './components/layout/RightPanel';
import { useDocumentStore } from './stores/documentStore';

import styles from './styles/App.module.css';

export default function App() {
  const initialize = useDocumentStore(
    (state) => state.initialize,
  );

  const initialized = useDocumentStore(
    (state) => state.initialized,
  );

  const loading = useDocumentStore(
    (state) => state.loading,
  );

  const error = useDocumentStore(
    (state) => state.error,
  );

  const runningInTauri = isTauri();

  useEffect(() => {
    if (runningInTauri) {
      void initialize();
    }
  }, [initialize, runningInTauri]);

  if (!runningInTauri) {
    return (
      <main className={styles.runtimeMessage}>
        <h1>LLM Wiki</h1>
        <p>
          브라우저 미리보기입니다.
          실제 데이터는 Tauri 앱에서 확인하세요.
        </p>
      </main>
    );
  }

  if (loading || !initialized) {
    return (
      <main className={styles.runtimeMessage}>
        데이터를 불러오는 중입니다.
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.runtimeMessage}>
        <h2>초기화 실패</h2>
        <pre>{error}</pre>
      </main>
    );
  }

  return (
    <div className={styles.app}>
      <header />

      <div className={styles.main}>
        <div className={styles.sidebarArea}>
          <Sidebar />
        </div>

        <div
          className={`${styles.resizeHandle} ${styles.leftResizeHandle}`}
        />

        <div className={styles.contentArea}>
          <MainContent />
        </div>

        <div
          className={`${styles.resizeHandle} ${styles.rightResizeHandle}`}
        />

        <div className={styles.rightPanelArea}>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}