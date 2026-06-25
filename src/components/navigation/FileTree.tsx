import { useState } from 'react';
import type { FileTreeNode } from '../../types/document';
import { useDocumentStore } from '../../stores/documentStore';
import styles from './FileTree.module.css';

interface FileTreeProps {
  nodes: FileTreeNode[];
  depth?: number;
}

function TreeNode({ node, depth = 0 }: { node: FileTreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const selectDocument = useDocumentStore(
    (state) => state.selectDocument,
  );

  const selectedDocument = useDocumentStore(
    (state) => state.selectedDocument,
  );

  const isFolder = node.type === 'folder';
  const isActive = node.documentId === selectedDocument?.id;

  const handleClick = () => {
    if (isFolder) {
      setExpanded((e) => !e);
    } else if (node.documentId) {
      selectDocument(node.documentId);
    }
  };

  return (
    <div className={styles.node}>
      <div
        className={isActive ? styles.rowActive : styles.row}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span
          className={`${styles.chevron} ${!isFolder ? styles.chevronHidden : ''}`}
        >
          {expanded ? '▾' : '▸'}
        </span>
        <span className={styles.icon}>{isFolder ? '📁' : '📄'}</span>
        <span className={styles.label}>{node.name}</span>
      </div>
      {isFolder && expanded && node.children && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ nodes }: FileTreeProps) {
  return (
    <div className={styles.tree}>
      {nodes.map((node) => (
        <TreeNode key={node.path} node={node} />
      ))}
    </div>
  );
}
