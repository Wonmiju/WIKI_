---
id: model-rtdetr
title: RT-DETR
type: model
tags:
  - object-detection
  - transformer
  - real-time
  - end-to-end
  - uav
aliases:
  - RTDETR
  - Real-Time Detection Transformer
created: 2026-06-24
updated: 2026-06-24
---

# RT-DETR

## 개요

RT-DETR은 [[Object Detection]]을 위한 **실시간 End-to-End Transformer 기반 객체 검출 모델**이다.

기존 [[DETR]] 계열은 Transformer Decoder의 높은 연산량과 느린 수렴 속도로 인해 실시간 환경에 적용하기 어려웠다. RT-DETR은 이러한 문제를 해결하기 위해 **CNN Backbone**, **Efficient Hybrid Encoder**, **IoU-aware Query Selection**, **Transformer Decoder**를 결합한다.

RT-DETR은 [[Non-Maximum Suppression|NMS]] 없이 최종 객체를 검출하는 **NMS-free detector**이며, 학습부터 추론까지 하나의 End-to-End 구조로 구성된다.

---

## 핵심 특징

- Transformer 기반 End-to-End 객체 검출
- NMS가 필요하지 않는 NMS-free 구조
- CNN과 Transformer를 결합한 Hybrid Architecture
- IoU 기반 Query Selection을 통한 Decoder 입력 최적화
- Decoder Layer 수를 조절하여 정확도와 추론 속도 간 Trade-off 제어 가능
- 실시간 객체 검출을 고려한 경량 Encoder 구조 사용

---

## 전체 구조

```text
Input Image
    ↓
CNN Backbone
    ↓
Multi-scale Feature Maps
    ↓
Efficient Hybrid Encoder
    ↓
IoU-aware Query Selection
    ↓
Transformer Decoder
    ↓
Class Prediction + Bounding Box Regression