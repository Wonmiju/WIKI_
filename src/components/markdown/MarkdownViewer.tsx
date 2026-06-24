import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import type { Components } from 'react-markdown';
import { WikiLink } from './WikiLink';
import styles from './MarkdownViewer.module.css';

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g;

function preprocessWikiLinks(content: string): string {
  return content.replace(WIKI_LINK_RE, (_, title: string) => {
    return `[${title}](wiki:${encodeURIComponent(title)})`;
  });
}

function createComponents(): Components {
  return {
    a: ({ href, children }) => {
      if (href?.startsWith('wiki:')) {
        const title = decodeURIComponent(href.slice(5));
        return <WikiLink title={title} />;
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    code: ({ className, children, ...props }) => {
      const isBlock = className?.includes('language-');
      if (isBlock) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={styles.inlineCode} {...props}>
          {children}
        </code>
      );
    },
    table: ({ children }) => (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>{children}</table>
      </div>
    ),
  };
}

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const processed = preprocessWikiLinks(content);

  return (
    <div className={styles.viewer}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={createComponents()}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
