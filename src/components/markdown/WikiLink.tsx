import type { ReactNode } from 'react';

import { useDocumentStore } from '../../stores/documentStore';

import styles from './WikiLink.module.css';

interface WikiLinkProps {
  title: string;
  children?: ReactNode;
}

export default function WikiLink({
  title,
  children,
}: WikiLinkProps) {
  const selectDocumentByTitle = useDocumentStore(
    (state) => state.selectDocumentByTitle,
  );

  const handleClick = (): void => {
    void selectDocumentByTitle(title);
  };

  return (
    <button
      type="button"
      className={styles.link}
      onClick={handleClick}
    >
      {children ?? title}
    </button>
  );
}