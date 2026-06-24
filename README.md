# LLM Wiki App

Local-first LLM Knowledge Wiki Desktop App — Obsidian Help 스타일의 3열 지식관리 앱.

## Phase 1 (현재): UI 프로토타입

브라우저에서 실행되는 React UI 프로토타입입니다. Mock 데이터로 동작합니다.

### 실행

```bash
npm install
npm run dev
```

브라우저: http://localhost:5173

### 구현된 기능

- 3열 레이아웃 (좌측 탐색기 / 중앙 Markdown / 우측 그래프)
- 폴더 트리, 태그, 최근 문서
- Markdown 렌더링 (GFM, 수식, 코드 하이라이트)
- `[[Wiki Link]]` 클릭 이동
- Cytoscape.js Local Graph
- Backlinks, Properties, TOC
- 다크/라이트 테마
- 패널 크기 조절 및 접기

### 기술 스택

- React + TypeScript + Vite
- Zustand (상태 관리)
- react-markdown + remark-gfm + remark-math + rehype-katex
- Cytoscape.js (그래프)
- CSS Modules

### 다음 단계 (Phase 2)

- 로컬 Markdown vault 연결
- YAML frontmatter 파싱
- Fuse.js 검색
- Tauri 2 데스크톱 변환 (Phase 4)

## 프로젝트 구조

```
src/
├── components/
│   ├── layout/       Sidebar, MainContent, RightPanel, Header
│   ├── graph/        LocalGraph
│   ├── markdown/     MarkdownViewer, WikiLink
│   ├── navigation/   FileTree, TagList, RecentDocuments
│   └── properties/   Backlinks, PropertiesPanel
├── data/             mockDocuments.ts (Phase 1)
├── stores/           documentStore, settingsStore
└── types/            document, graph
vault/                샘플 Markdown (Phase 2에서 연결)
```
