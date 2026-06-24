import { useState } from 'react';
import styles from './TagList.module.css';

interface TagListProps {
  tags: string[];
}

export function TagList({ tags }: TagListProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <div className={styles.list}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={activeTag === tag ? styles.tagActive : styles.tag}
          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
