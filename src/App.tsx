import { useEffect } from 'react';

import { useDocumentStore } from './stores/documentStore';

function App() {
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

  useEffect(() => {
    void initialize();
    console.log('현재 URL:', window.location.href);
    console.log(
      'Tauri runtime:',
      '__TAURI_INTERNALS__' in window,
    );
  }, [initialize]);

  if (!initialized && loading) {
    return <div>MariaDB 데이터 로딩 중...</div>;
  }

  if (!initialized && error) {
    return (
      <div>
        <h2>데이터베이스 조회 실패</h2>
        <pre>{error}</pre>
      </div>
    );
  }

  return (
    <div className="app">
      {/* 기존 레이아웃 유지 */}
    </div>
  );
}

export default App;