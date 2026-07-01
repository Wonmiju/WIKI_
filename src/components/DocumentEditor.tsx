import { useEffect, useState } from 'react';

export interface WikiDocument {
    id: number | string;
    title: string;
    path?: string;
    type?: string;
    content?: string;
    updatedAt?: string;
}

interface DocumentEditorProps {
    document: WikiDocument | null;

    onChange: (
        id: WikiDocument['id'],
        changes: Partial<WikiDocument>,
    ) => void;

    onSave: (
        document: WikiDocument,
    ) => Promise<void> | void;
}

function DocumentEditor({
    document,
    onChange,
    onSave,
}: DocumentEditorProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setTitle(document?.title ?? '');
        setContent(document?.content ?? '');
        setDirty(false);
    }, [document]);

    if (!document) {
        return (
            <section className="editor-empty">
                <h2>문서를 선택하세요.</h2>
                <p>왼쪽 문서 목록에서 편집할 문서를 선택합니다.</p>
            </section>
        );
    }

    const handleSave = async () => {
        const nextDocument: WikiDocument = {
            ...document,
            title,
            content,
        };

        setSaving(true);

        try {
            onChange(document.id, {
                title,
                content,
            });

            await onSave(nextDocument);
            setDirty(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="document-workspace">
            <div className="document-toolbar">
                <div className="document-meta">
                    <input
                        className="document-title-input"
                        value={title}
                        onChange={(event) => {
                            setTitle(event.target.value);
                            setDirty(true);
                        }}
                        placeholder="문서 제목"
                    />

                    <div className="document-path">
                        {document.path ?? `documents/${document.title}.md`}
                    </div>
                </div>

                <div className="document-actions">
                    <span className={dirty ? 'dirty-state' : 'saved-state'}>
                        {dirty ? '수정됨' : '저장됨'}
                    </span>

                    <button
                        type="button"
                        className="save-button"
                        disabled={saving || !dirty}
                        onClick={() => void handleSave()}
                    >
                        {saving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>

            <div className="editor-grid">
                <div className="editor-column">
                    <div className="panel-title">Markdown 편집</div>

                    <textarea
                        className="document-textarea"
                        value={content}
                        onChange={(event) => {
                            setContent(event.target.value);
                            setDirty(true);
                        }}
                        placeholder="문서 내용을 입력하세요."
                        spellCheck={false}
                    />
                </div>

                <div className="preview-column">
                    <div className="panel-title">미리보기</div>

                    <article className="document-preview">
                        <h1>{title || '제목 없음'}</h1>

                        {content ? (
                            <pre>{content}</pre>
                        ) : (
                            <p className="empty-text">
                                작성된 내용이 없습니다.
                            </p>
                        )}
                    </article>
                </div>
            </div>
        </section>
    );
}

export default DocumentEditor;