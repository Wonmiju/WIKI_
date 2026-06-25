import { useState } from 'react';
import { useDocumentStore } from '../../stores/documentStore';

export function Header() {
  const selectedDocument = useDocumentStore(
    (state) => state.selectedDocument,
  );

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header>
      <div>
        {selectedDocument?.frontmatter.title ?? 'LLM Wiki'}
      </div>

      <input
        type="search"
        value={searchQuery}
        onChange={(event) => {
          setSearchQuery(event.target.value);
        }}
        placeholder="검색"
      />
    </header>
  );
}