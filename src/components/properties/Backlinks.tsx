import { useDocumentStore } from '../../stores/documentStore';

export default function Backlinks() {
  const document = useDocumentStore(
    (state) => state.selectedDocument,
  );

  const openWikiLink = useDocumentStore(
    (state) => state.openWikiLink,
  );

  if (!document) {
    return null;
  }

  return (
    <section>
      <h3>Backlinks</h3>

      {document.backlinks.length === 0 ? (
        <p>Backlink 없음</p>
      ) : (
        <ul>
          {document.backlinks.map((title) => (
            <li key={title}>
              <button
                type="button"
                onClick={() =>
                  void openWikiLink(title)
                }
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}