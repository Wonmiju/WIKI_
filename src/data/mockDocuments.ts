import type { Document, FileTreeNode } from '../types/document';
import type { GraphData } from '../types/graph';

export const MOCK_DOCUMENTS: Record<string, Document> = {
  'model-rtdetr': {
    id: 'model-rtdetr',
    path: 'models/RT-DETR.md',
    frontmatter: {
      id: 'model-rtdetr',
      title: 'RT-DETR',
      type: 'model',
      tags: ['object-detection', 'transformer', 'uav'],
      aliases: ['RTDETR'],
      created: '2026-06-24',
      updated: '2026-06-24',
    },
    outgoingLinks: [
      'Object Detection',
      'ResNet-18',
      'Hybrid Encoder',
      'Transformer Decoder',
      'SFEM',
      'CARAFE',
      'COCO',
      'VisDrone2019',
      'EXP-001 RT-DETR Baseline',
      'EXP-002 RT-DETR SFEM',
    ],
    backlinks: ['SFEM', 'CARAFE', 'VisDrone2019'],
    content: `# RT-DETR

RT-DETR은 [[Object Detection]]을 위한 실시간 Transformer 검출기다.

## 구조

- Backbone: [[ResNet-18]]
- Encoder: [[Hybrid Encoder]]
- Decoder: [[Transformer Decoder]]

## 관련 모듈

- [[SFEM]]
- [[CARAFE]]

## 평가 데이터셋

- [[COCO]]
- [[VisDrone2019]]

## 관련 실험

- [[EXP-001 RT-DETR Baseline]]
- [[EXP-002 RT-DETR SFEM]]

## 성능 요약

| 데이터셋 | mAP | FPS |
|---------|-----|-----|
| COCO | 53.1 | 108 |
| VisDrone2019 | 41.2 | 95 |

수식 예시: $AP = \\int_0^1 p(r) \\, dr$
`,
  },
  'module-sfem': {
    id: 'module-sfem',
    path: 'models/SFEM.md',
    frontmatter: {
      id: 'module-sfem',
      title: 'SFEM',
      type: 'module',
      tags: ['attention', 'feature-enhancement'],
      created: '2026-06-20',
      updated: '2026-06-22',
    },
    outgoingLinks: ['RT-DETR', 'Feature Enhancement'],
    backlinks: ['RT-DETR', 'EXP-002 RT-DETR SFEM'],
    content: `# SFEM

**Scale-aware Feature Enhancement Module** — 다중 스케일 특징을 강화하는 모듈.

[[RT-DETR]]의 encoder에 삽입하여 소형 객체 검출 성능을 개선한다.

## 핵심 아이디어

- 채널 어텐션 + 공간 어텐션 결합
- [[Feature Enhancement]] 파이프라인의 핵심 구성요소
`,
  },
  'concept-object-detection': {
    id: 'concept-object-detection',
    path: 'concepts/Object Detection.md',
    frontmatter: {
      id: 'concept-object-detection',
      title: 'Object Detection',
      type: 'concept',
      tags: ['computer-vision', 'fundamentals'],
      created: '2026-06-01',
      updated: '2026-06-15',
    },
    outgoingLinks: ['COCO', 'VisDrone2019'],
    backlinks: ['RT-DETR'],
    content: `# Object Detection

이미지에서 객체의 **위치(bounding box)**와 **클래스**를 동시에 예측하는 컴퓨터 비전 태스크.

## 주요 접근법

1. Two-stage (R-CNN 계열)
2. One-stage (YOLO, RT-DETR)
3. Transformer-based (DETR, [[RT-DETR]])

## 평가 지표

- mAP (mean Average Precision)
- IoU (Intersection over Union)
`,
  },
  'dataset-visdrone': {
    id: 'dataset-visdrone',
    path: 'datasets/VisDrone2019.md',
    frontmatter: {
      id: 'dataset-visdrone',
      title: 'VisDrone2019',
      type: 'dataset',
      tags: ['uav', 'aerial', 'benchmark'],
      created: '2026-06-10',
      updated: '2026-06-18',
    },
    outgoingLinks: ['Object Detection'],
    backlinks: ['RT-DETR', 'Object Detection'],
    content: `# VisDrone2019

UAV(드론) 촬영 영상 기반 객체 검출 벤치마크 데이터셋.

## 특징

- 소형 객체 비율 높음
- 밀집 장면 다수
- [[Object Detection]] 연구에서 UAV 도메인 표준 벤치마크

[[RT-DETR]] 평가에 사용됨.
`,
  },
};

export const FILE_TREE: FileTreeNode[] = [
  {
    name: 'papers',
    path: 'papers',
    type: 'folder',
    children: [],
  },
  {
    name: 'models',
    path: 'models',
    type: 'folder',
    children: [
      {
        name: 'RT-DETR.md',
        path: 'models/RT-DETR.md',
        type: 'file',
        documentId: 'model-rtdetr',
      },
      {
        name: 'SFEM.md',
        path: 'models/SFEM.md',
        type: 'file',
        documentId: 'module-sfem',
      },
    ],
  },
  {
    name: 'modules',
    path: 'modules',
    type: 'folder',
    children: [],
  },
  {
    name: 'datasets',
    path: 'datasets',
    type: 'folder',
    children: [
      {
        name: 'VisDrone2019.md',
        path: 'datasets/VisDrone2019.md',
        type: 'file',
        documentId: 'dataset-visdrone',
      },
    ],
  },
  {
    name: 'concepts',
    path: 'concepts',
    type: 'folder',
    children: [
      {
        name: 'Object Detection.md',
        path: 'concepts/Object Detection.md',
        type: 'file',
        documentId: 'concept-object-detection',
      },
    ],
  },
  {
    name: 'experiments',
    path: 'experiments',
    type: 'folder',
    children: [],
  },
];

export const ALL_TAGS = [
  'object-detection',
  'transformer',
  'uav',
  'attention',
  'feature-enhancement',
  'computer-vision',
  'fundamentals',
  'aerial',
  'benchmark',
];

export const RECENT_DOCUMENTS = [
  { id: 'model-rtdetr', title: 'RT-DETR', path: 'models/RT-DETR.md' },
  { id: 'module-sfem', title: 'SFEM', path: 'models/SFEM.md' },
  { id: 'dataset-visdrone', title: 'VisDrone2019', path: 'datasets/VisDrone2019.md' },
];

export function buildLocalGraph(documentId: string): GraphData {
  const doc = MOCK_DOCUMENTS[documentId];
  if (!doc) return { nodes: [], edges: [] };

  const nodes: GraphData['nodes'] = [
    {
      id: doc.id,
      label: doc.frontmatter.title,
      type: doc.frontmatter.type,
    },
  ];
  const edges: GraphData['edges'] = [];

  for (const linkTitle of doc.outgoingLinks) {
    const linked = Object.values(MOCK_DOCUMENTS).find(
      (d) => d.frontmatter.title === linkTitle,
    );
    if (linked) {
      nodes.push({
        id: linked.id,
        label: linked.frontmatter.title,
        type: linked.frontmatter.type,
      });
      edges.push({ source: doc.id, target: linked.id, type: 'links' });
    }
  }

  for (const backTitle of doc.backlinks) {
    const linked = Object.values(MOCK_DOCUMENTS).find(
      (d) => d.frontmatter.title === backTitle,
    );
    if (linked && !nodes.find((n) => n.id === linked.id)) {
      nodes.push({
        id: linked.id,
        label: linked.frontmatter.title,
        type: linked.frontmatter.type,
      });
    }
    if (linked) {
      edges.push({ source: linked.id, target: doc.id, type: 'backlink' });
    }
  }

  return { nodes, edges };
}

export function findDocumentByTitle(title: string): Document | undefined {
  return Object.values(MOCK_DOCUMENTS).find(
    (d) =>
      d.frontmatter.title === title ||
      d.frontmatter.aliases?.includes(title),
  );
}

export function findDocumentById(id: string): Document | undefined {
  return MOCK_DOCUMENTS[id];
}
