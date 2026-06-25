import type {
    DocumentSummary,
    FileTreeNode,
} from '../types/document';

export function buildFileTree(
    documents: DocumentSummary[],
): FileTreeNode[] {
    const root: FileTreeNode[] = [];

    for (const document of documents) {
        const parts = document.path
            .replaceAll('\\', '/')
            .split('/')
            .filter(Boolean);

        let currentLevel = root;

        for (
            let index = 0;
            index < parts.length;
            index += 1
        ) {
            const part = parts[index];
            const isFile = index === parts.length - 1;

            const currentPath = parts
                .slice(0, index + 1)
                .join('/');

            if (isFile) {
                currentLevel.push({
                    name: part,
                    path: currentPath,
                    type: 'file',
                    documentId: document.id,
                });

                continue;
            }

            let folder = currentLevel.find(
                (node) =>
                    node.type === 'folder' &&
                    node.path === currentPath,
            );

            if (!folder) {
                folder = {
                    name: part,
                    path: currentPath,
                    type: 'folder',
                    children: [],
                };

                currentLevel.push(folder);
            }

            folder.children ??= [];
            currentLevel = folder.children;
        }
    }

    sortTree(root);

    return root;
}

function sortTree(nodes: FileTreeNode[]): void {
    nodes.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
    });

    for (const node of nodes) {
        if (node.children) {
            sortTree(node.children);
        }
    }
}