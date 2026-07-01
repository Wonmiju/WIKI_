import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { DocumentType } from '../../types/document';
import { useDocumentStore } from '../../stores/documentStore';
import MarkdownViewer from '../markdown/MarkdownViewer';

import styles from './MainContent.module.css';

const TYPE_CLASS: Record<DocumentType, string> = {
  model: styles.typeModel,
  module: styles.typeModule,
  dataset: styles.typeDataset,
  concept: styles.typeConcept,
  experiment: styles.typeExperiment,
  paper: styles.typePaper,
};

export function MainContent() {
  const selectedDocument = useDocumentStore(
    (state) => state.selectedDocument,
  );

  const selectDocumentByTitle = useDocumentStore(
    (state) => state.selectDocumentByTitle,
  );

  const updateSelectedDocumentContent = useDocumentStore(
    (state) => state.updateSelectedDocumentContent,
  );

  const [editing, setEditing] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setDraftContent(selectedDocument?.content ?? '');
    setEditing(false);
    setSaving(false);
    setSaveError(null);
  }, [selectedDocument]);

  const isDirty = useMemo(() => {
    if (!selectedDocument) {
      return false;
    }

    return draftContent !== selectedDocument.content;
  }, [draftContent, selectedDocument]);

  if (!selectedDocument) {
    return (
      <main className={styles.container}>
        <div className={styles.empty}>
          문서를 선택하세요
        </div>
      </main>
    );
  }

  const {
    path,
    frontmatter,
    content,
    outgoingLinks,
  } = selectedDocument;

  const handleCancelEdit = () => {
    if (saving) {
      return;
    }

    setDraftContent(content);
    setSaveError(null);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!isDirty) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      await updateSelectedDocumentContent(
        draftContent,
      );

      /*
       * Store에서 selectedDocument가 최신 내용으로 갱신된 뒤
       * 보기 모드로 복귀한다.
       */
      setEditing(false);
    } catch (error: unknown) {
      setSaveError(
        error instanceof Error
          ? error.message
          : String(error),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.inner}>
        <header className={styles.documentHeader}>
          <div className={styles.headerTop}>
            <div className={styles.headingGroup}>
              <h1 className={styles.title}>
                {frontmatter.title}
              </h1>

              <div className={styles.path}>
                {path}
              </div>
            </div>

            <div className={styles.actions}>
              {editing ? (
                <>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    className={styles.saveButton}
                    disabled={!isDirty || saving}
                    onClick={() => {
                      void handleSave();
                    }}
                  >
                    {saving
                      ? '저장 중...'
                      : '저장'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={() => {
                    setDraftContent(content);
                    setSaveError(null);
                    setEditing(true);
                  }}
                >
                  편집
                </button>
              )}
            </div>
          </div>

          <div className={styles.meta}>
            <span
              className={[
                styles.metaBadge,
                TYPE_CLASS[frontmatter.type],
              ].join(' ')}
            >
              {frontmatter.type}
            </span>

            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className={styles.tag}
              >
                #{tag}
              </span>
            ))}

            {frontmatter.created && (
              <span className={styles.date}>
                Created {frontmatter.created}
              </span>
            )}

            {frontmatter.updated && (
              <span className={styles.date}>
                Updated {frontmatter.updated}
              </span>
            )}
          </div>
        </header>

        <section className={styles.contentSection}>
          {editing ? (
            <div className={styles.editorWrapper}>
              <div className={styles.editorHeader}>
                <span>Markdown 편집</span>

                <span
                  className={
                    saving
                      ? styles.savedState
                      : isDirty
                        ? styles.dirtyState
                        : styles.savedState
                  }
                >
                  {saving
                    ? '저장 중...'
                    : isDirty
                      ? '수정됨'
                      : '변경 없음'}
                </span>
              </div>

              {saveError && (
                <div className={styles.saveError}>
                  {saveError}
                </div>
              )}

              <textarea
                className={styles.editor}
                value={draftContent}
                onChange={(event) => {
                  setDraftContent(
                    event.target.value,
                  );
                }}
                placeholder="Markdown 문서 내용을 입력하세요."
                spellCheck={false}
                disabled={saving}
              />

              <div className={styles.previewSection}>
                <div className={styles.previewTitle}>
                  미리보기
                </div>

                <MarkdownViewer
                  content={draftContent}
                />
              </div>
            </div>
          ) : (
            <MarkdownViewer content={content} />
          )}
        </section>

        {outgoingLinks.length > 0 && (
          <section className={styles.outgoing}>
            <div className={styles.outgoingTitle}>
              Outgoing Links
            </div>

            <div className={styles.outgoingList}>
              {outgoingLinks.map((link) => (
                <button
                  type="button"
                  key={link}
                  className={styles.outgoingLink}
                  onClick={() => {
                    void selectDocumentByTitle(link);
                  }}
                >
                  {link}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}