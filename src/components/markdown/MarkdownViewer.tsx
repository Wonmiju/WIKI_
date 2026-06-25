import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { useDocumentStore } from '../../stores/documentStore';

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({
  content,
}: MarkdownViewerProps) {
  const document = useDocumentStore(
    (state) => state.selectedDocument,
  );

  if (!document) {
    return <main>선택된 문서가 없습니다.</main>;
  }

  return (
    <main>
      <header>
        <h1>{document.frontmatter.title}</h1>

        <div>
          {document.frontmatter.tags.map((tag) => (
            <span key={tag}>
              #{tag}{' '}
            </span>
          ))}
        </div>
      </header>

      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
        ]}
        rehypePlugins={[
          rehypeKatex,
        ]}
      >
        {document.content}
      </ReactMarkdown>
    </main>
  );
}