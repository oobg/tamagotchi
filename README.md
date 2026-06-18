# Tamagotchi 🥚

브라우저에서 굴러가는 다마고치 스타일 가상 펫 게임입니다. Next.js App Router 위에서 Phaser가 펫을 그리고, Zustand 스토어 하나가 React UI 패널과 Phaser 씬을 함께 굴립니다.

> **MVP 상태:** 시간 기반 상태 변화, 5단계 성장, 사용자 액션, care miss 누적, localStorage persist까지 동작합니다. 펫 그래픽은 아직 placeholder 도형이며, 도트 sprite sheet로 교체할 예정입니다.

## 핵심 메커닉

- **시간 감쇠** — `hunger`, `happiness`, `hygiene`은 시간이 지날수록 감소하고, `energy`는 깨어 있으면 줄고 자면 회복합니다. 임계 미만이 지속되면 `health`가 떨어지고 `careMissCount`가 누적됩니다.
- **백그라운드 진행** — `lastUpdatedAt` 타임스탬프로 앱이 닫혀 있던 시간을 다시 열 때 한 번에 적용합니다.
- **성장 단계** — `egg(1분) → baby(5분) → child(10분) → teen(15분) → adult` (튜닝 가능, `features/pet/logic/constants.ts`).
- **사용자 액션** — Feed / Play / Sleep ↔ Wake / Clean / Heal / Toilet / Reset.
- **부수 효과** — 일정 주기로 `poopCount`가 증가하고 청결도를 잠식, health가 낮으면 자동으로 `isSick`.

## 기술 스택

- **Next.js 15.3.1** — App Router, 정적 export (`output: 'export'`)
- **React 19** — `"use client"` + `dynamic(..., { ssr: false })`로 Phaser 클라이언트 전용 로드
- **Phaser 4** — 펫 씬 렌더링 (`PetRoomScene`)
- **Zustand 5** — 상태 관리 + localStorage persist
- **Tailwind CSS v4** — UI 패널 스타일링
- **TypeScript 5**

## 실행

```bash
npm install
npm run dev          # http://localhost:8080
```

| 커맨드                              | 설명                                                 |
| ----------------------------------- | ---------------------------------------------------- |
| `npm install`                       | 의존성 설치                                          |
| `npm run dev`                       | 개발 서버 실행 (포트 8080)                           |
| `npm run build`                     | `dist/` 폴더에 정적 빌드                             |
| `npm run dev-nolog` / `build-nolog` | 익명 템플릿 통계 호출 없이 실행 (아래 _log.js_ 참고) |

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃, metadata, globals.css
│   └── page.tsx                # 클라이언트 페이지, App을 dynamic ssr:false로 로드
├── App.tsx                     # Phaser 캔버스 + React 패널 컨테이너, tick 루프
├── PhaserGame.tsx              # Phaser 게임 인스턴스 마운트/언마운트
│
├── stores/
│   └── pet-store.ts            # Zustand persist 스토어 (단일 진실 원천)
│
├── features/pet/
│   ├── types.ts                # PetState, PetStage, PetMood
│   ├── logic/
│   │   ├── apply-time-decay.ts # 경과 시간 → stat 감쇠, careMiss, poop, stage 재계산
│   │   ├── growth.ts           # 단계 계산 / 진행률
│   │   ├── mood.ts             # PetState → PetMood 도출
│   │   ├── clamp.ts            # 0~100 포화
│   │   └── constants.ts        # 감쇠율, 단계 지속 시간 (튜닝 포인트)
│   └── components/
│       ├── PetStatusPanel.tsx
│       ├── PetActionPanel.tsx
│       ├── GrowthStageBadge.tsx
│       ├── CareMissIndicator.tsx
│       └── DebugPanel.tsx
│
└── game/
    ├── main.ts                 # Phaser config, PetRoomScene 등록
    ├── scenes/
    │   └── PetRoomScene.ts     # placeholder 도형으로 펫 렌더 + store 구독
    ├── assets/
    │   └── pet-assets.ts       # sprite sheet 경로 설정 (현재는 placeholder)
    ├── animations/
    │   └── pet-animations.ts   # idle/happy/hungry/sick/sleeping/dirty/eating/playing 키 정의
    └── EventBus.ts             # React ↔ Phaser 보조 이벤트 버스

public/
└── assets/
    └── pets/<theme>/sprite-sheet.png   # (예정) 도트 sprite + metadata.json
```

## 아키텍처

```
                    ┌──────────────────────────┐
                    │   usePetStore (Zustand)  │
                    │   + localStorage persist │
                    └────────────┬─────────────┘
                                 │ subscribe
              ┌──────────────────┼──────────────────┐
              │                  │                  │
       React 패널           PetRoomScene       App.tsx tick 루프
   (status / actions /     (Phaser canvas)    1초마다 tick()
    growth / debug)                            visibilitychange syncTime()
```

- 펫 데이터는 **Zustand에만** 존재합니다. React state와 Phaser scene 모두 직접 들고 있지 않고 구독만 합니다.
- 모든 사용자 액션은 먼저 `applyTimeDecay`로 시간을 동기화한 뒤 상태를 바꿉니다 — 액션 직전까지의 시간이 빠지지 않습니다.
- 페이지 마운트 시 `syncTime()`이 한 번 호출되어 앱이 꺼져 있던 시간이 즉시 반영됩니다.

## 에셋 정책 (현재 단계)

- 펫과 배경은 **Phaser 기본 도형(원, 사각형, 텍스트)으로만** 렌더됩니다.
- 외부 이미지 다운로드, 생성된 sprite, 무작위 그래픽 자산은 추가하지 않습니다.
- `game/animations/pet-animations.ts`의 8개 애니메이션 키(`idle`, `happy`, `hungry`, `sick`, `sleeping`, `dirty`, `eating`, `playing`)는 **키만 정의되고 본체는 비어 있습니다.** sprite sheet를 `public/assets/pets/<theme>/` 아래에 두고 Preloader에서 등록하면 바로 활성화됩니다.
- 에셋 경로는 `game/assets/pet-assets.ts`에서 설정 가능합니다.

## 향후 작업

가까운 목표:

- 도트 sprite sheet 도입 (`default` 테마)
- 단계별 외형 변화
- 사운드 / 효과음

MVP 범위 밖 (당분간 만들지 않음):

- 인증 / DB / API 라우트
- 상점·인벤토리·미니게임·결혼·맵 해금
- 멀티플레이어·친구·온라인 기능
- AI 이미지 생성

## log.js에 대하여

원본 [phaserjs/template-nextjs](https://github.com/phaserjs/template-nextjs) 템플릿에서 따라온 `log.js`는 빌드/개발 시 Phaser Studio의 `gryzor.co`로 익명 사용 통계(템플릿 이름, 빌드 유형, Phaser 버전)를 한 번 전송합니다. 개인정보는 전송되지 않습니다. 끄려면 `npm run dev-nolog` / `npm run build-nolog`을 쓰거나, `package.json`의 `scripts`에서 `node log.js ... &` 부분을 빼면 됩니다.

## 크레딧

원본 Next.js + Phaser 템플릿: [Phaser Studio](https://phaser.io) — [phaserjs/template-nextjs](https://github.com/phaserjs/template-nextjs).
다마고치 게임 로직 / Zustand 통합 / App Router 마이그레이션: 이 레포 작업.

Phaser 로고와 캐릭터는 © 2011 - 2025 Phaser Studio Inc.
