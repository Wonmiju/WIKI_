import { useDocumentStore } from '../../stores/documentStore';

export default function Sidebar() {
  const documents = useDocumentStore(
    (state) => state.documents,
  );

  const selectedDocument = useDocumentStore(
    (state) => state.selectedDocument,
  );

  const selectDocument = useDocumentStore(
    (state) => state.selectDocument,
  );

  return (
    <aside>
      <h3>Documents</h3>

      <ul>
        {documents.map((document) => (
          <li key={document.id}>
            <button
              type="button"
              className={
                selectedDocument?.id === document.id
                  ? 'active'
                  : ''
              }
              onClick={() =>
                void selectDocument(document.id)
              }
            >
              {document.title}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}