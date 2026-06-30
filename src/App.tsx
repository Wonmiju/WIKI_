import { useEffect } from 'react';

import { useDocumentStore } from './stores/documentStore';

import './App.css';

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

  /*
   * Store 초기화 전에 undefined일 수 있으므로
   * 일단 원본 상태를 가져온 뒤 아래에서 빈 배열로 보정한다.
   */
  const documentsState = useDocumentStore(
    (state) => state.documents,
  );

  const tagsState = useDocumentStore(
    (state) => state.tags,
  );

  const recentDocumentsState = useDocumentStore(
    (state) => state.recentDocuments,
  );

  const graphNodesState = useDocumentStore(
    (state) => state.graphNodes,
  );

  const graphEdgesState = useDocumentStore(
    (state) => state.graphEdges,
  );

  const selectedDocument = useDocumentStore(
    (state) => state.selectedDocument,
  );

  const selectDocument = useDocumentStore(
    (state) => state.selectDocument,
  );

  /*
   * undefined 방지
   *
   * 이제 아래 JSX에서 .length와 .map을 안전하게 사용할 수 있다.
   */
  const documents = documentsState ?? [];
  const tags = tagsState ?? [];
  const recentDocuments = recentDocumentsState ?? [];
  const graphNodes = graphNodesState ?? [];
  const graphEdges = graphEdgesState ?? [];

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (loading && !initialized) {
    return (
      <div className="app-state">
        문서 데이터베이스를 불러오는 중입니다.
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-state app-error">
        <div>
          <h2>초기화 실패</h2>
          <pre>{String(error)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>LLM Wiki</h1>
          <p>Local Knowledge Management System</p>
        </div>

        <div className="connection-status">
          <span className="status-dot" />
          MariaDB 연결 완료
        </div>
      </header>

      <div className="app-body">
        {/* 좌측 문서 및 태그 패널 */}
        <aside className="sidebar">
          <section className="sidebar-section">
            <div className="section-header">
              <h2>문서</h2>
              <span>{documents.length}</span>
            </div>

            <div className="document-list">
              {documents.length > 0 ? (
                documents.map((document) => {
                  const selected =
                    selectedDocument?.id === document.id;

                  return (
                    <button
                      key={document.id}
                      type="button"
                      className={
                        selected
                          ? 'document-item selected'
                          : 'document-item'
                      }
                      onClick={() => {
                        void selectDocument(document.id);
                      }}
                    >
                      <span className="document-title">
                        {document.title}
                      </span>

                      <span className="document-type">
                        {document.documentType}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="empty-list-message">
                  등록된 문서가 없습니다.
                </p>
              )}
            </div>
          </section>

          <section className="sidebar-section">
            <div className="section-header">
              <h2>태그</h2>
              <span>{tags.length}</span>
            </div>

            <div className="tag-list">
              {tags.length > 0 ? (
                tags.map((tag, index) => {
                  const tagName =
                    typeof tag === 'string'
                      ? tag
                      : tag.name;

                  const tagKey =
                    typeof tag === 'string'
                      ? tag
                      : tag.id ?? tag.name ?? index;

                  return (
                    <span
                      key={tagKey}
                      className="tag-chip"
                    >
                      {tagName}
                    </span>
                  );
                })
              ) : (
                <p className="empty-list-message">
                  등록된 태그가 없습니다.
                </p>
              )}
            </div>
          </section>
        </aside>

        {/* 중앙 문서 미리보기 */}
        <main className="content-panel">
          {selectedDocument ? (
            <>
              <div className="document-header">
                <div>
                  <span className="document-badge">
                    {selectedDocument.documentType}
                  </span>

                  <h2>{selectedDocument.title}</h2>

                  <p>{selectedDocument.path}</p>
                </div>
              </div>

              <article className="document-preview">
                {'content' in selectedDocument &&
                  typeof selectedDocument.content ===
                  'string' &&
                  selectedDocument.content.length > 0 ? (
                  <pre>{selectedDocument.content}</pre>
                ) : (
                  <div className="empty-preview">
                    <h3>문서가 선택되었습니다.</h3>

                    <p>
                      현재 조회 결과에는 문서 본문이 포함되지
                      않았습니다.
                    </p>

                    <dl>
                      <div>
                        <dt>ID</dt>
                        <dd>{selectedDocument.id}</dd>
                      </div>

                      <div>
                        <dt>경로</dt>
                        <dd>{selectedDocument.path}</dd>
                      </div>

                      <div>
                        <dt>수정일</dt>
                        <dd>
                          {selectedDocument.updatedAt
                            ? String(
                              selectedDocument.updatedAt,
                            )
                            : '-'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </article>
            </>
          ) : (
            <div className="empty-preview">
              선택된 문서가 없습니다.
            </div>
          )}
        </main>

        {/* 우측 그래프 및 최근 문서 패널 */}
        <aside className="graph-panel">
          <div className="section-header">
            <h2>로컬 그래프</h2>
          </div>

          <div className="graph-summary">
            <div>
              <strong>{graphNodes.length}</strong>
              <span>Nodes</span>
            </div>

            <div>
              <strong>{graphEdges.length}</strong>
              <span>Edges</span>
            </div>
          </div>

          <div className="graph-placeholder">
            <div className="graph-center-node">
              {selectedDocument?.title ?? '문서'}
            </div>

            <p>
              그래프 데이터 조회는 완료되었습니다. 이 영역에
              React Flow 또는 Cytoscape를 연결하면 실제 로컬
              그래프가 표시됩니다.
            </p>
          </div>

          <section className="recent-section">
            <h3>최근 문서</h3>

            {recentDocuments.length > 0 ? (
              recentDocuments.map((document) => (
                <button
                  key={document.id}
                  type="button"
                  onClick={() => {
                    void selectDocument(document.id);
                  }}
                >
                  <span>{document.title}</span>

                  <small>
                    {document.updatedAt
                      ? String(document.updatedAt)
                      : '-'}
                  </small>
                </button>
              ))
            ) : (
              <p className="empty-list-message">
                최근 문서가 없습니다.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default App;