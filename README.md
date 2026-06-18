# Phaser Next.js 템플릿 (Tamagotchi)

Next.js 프레임워크 위에서 Phaser 게임을 구동하는 프로젝트 템플릿입니다. React ↔ Phaser 양방향 통신 브리지, 개발 중 핫 리로드, 프로덕션 빌드 스크립트가 포함되어 있습니다.

### 버전

이 템플릿은 다음 버전 기준으로 최신화되어 있습니다.

- [Phaser 4](https://github.com/phaserjs/phaser)
- [Next.js 15.3.1](https://github.com/vercel/next.js) — **App Router**
- [React 19](https://react.dev/)
- [TypeScript 5](https://github.com/microsoft/TypeScript)

![screenshot](screenshot.png)

## 요구 사항

의존성 설치와 `npm` 스크립트 실행을 위해 [Node.js](https://nodejs.org)가 필요합니다.

## 사용 가능한 커맨드

| 커맨드 | 설명 |
|---------|-------------|
| `npm install` | 프로젝트 의존성 설치 |
| `npm run dev` | 개발 서버 실행 (포트 8080) |
| `npm run build` | `dist` 폴더에 프로덕션 빌드 생성 |
| `npm run dev-nolog` | 익명 통계 전송 없이 개발 서버 실행 (아래 "log.js에 대하여" 참고) |
| `npm run build-nolog` | 익명 통계 전송 없이 프로덕션 빌드 생성 (아래 "log.js에 대하여" 참고) |

## 개발 시작하기

레포를 클론한 뒤 프로젝트 디렉터리에서 `npm install`을 실행합니다. 이어서 `npm run dev`로 로컬 개발 서버를 띄울 수 있습니다.

로컬 개발 서버는 기본적으로 `http://localhost:8080`에서 동작합니다. 포트를 바꾸거나 SSL을 적용하고 싶다면 Next.js 공식 문서를 참고하세요.

서버가 실행 중이면 `src` 폴더의 어떤 파일이든 수정할 수 있습니다. Next.js가 자동으로 재컴파일한 뒤 브라우저를 리로드합니다.

## 프로젝트 구조

초기 구성은 다음과 같습니다. App Router 기반이므로 `src/app/` 하위에 라우트가 정의됩니다.

| 경로 | 설명 |
|-------------------------------|-----------------------------------------------------------------------------|
| `src/app/layout.tsx` | App Router의 루트 레이아웃. `<html>`/`<body>` 정의, 전역 metadata, viewport, `globals.css` import를 담당합니다. |
| `src/app/page.tsx` | 홈 라우트(`/`). Phaser가 `window`에 의존하므로 `dynamic(..., { ssr: false })`로 클라이언트 전용 로드 처리. |
| `src/App.tsx` | Phaser를 클라이언트에서 구동하기 위한 미들웨어 컴포넌트 (`"use client"`). |
| `src/PhaserGame.tsx` | Phaser 게임을 초기화하고 React ↔ Phaser 브리지 역할을 하는 컴포넌트 (`"use client"`). |
| `src/game/EventBus.ts` | React와 Phaser 사이 통신용 단순 이벤트 버스. |
| `src/game/main.ts` | **게임** 진입점. 게임 설정과 부트스트랩을 담당합니다. |
| `src/game/scenes/` | Phaser Scene 파일들이 위치합니다. |
| `src/styles/globals.css` | 페이지 레이아웃을 위한 간단한 전역 CSS. 여기에 Tailwind를 붙여도 됩니다. |
| `public/favicon.png` | 기본 파비콘. |
| `public/assets` | 게임에서 사용하는 정적 에셋 폴더. |

## React 브리지

`PhaserGame.tsx`가 React와 Phaser 사이의 다리입니다. Phaser 게임을 초기화하고 양쪽 이벤트를 중계합니다.

React ↔ Phaser 통신은 `EventBus.ts`를 사용합니다. 양쪽 어디서든 emit/listen이 가능한 단순한 이벤트 버스입니다.

```ts
// React 쪽
import { EventBus } from './EventBus';

// 이벤트 발행
EventBus.emit('event-name', data);

// Phaser 쪽
EventBus.on('event-name', (data) => {
    // data로 무언가를 처리
});
```

추가로, `PhaserGame` 컴포넌트는 React `forwardRef`를 통해 Phaser 게임 인스턴스와 가장 최근에 활성화된 Scene을 외부로 노출합니다. 일반적인 React ref처럼 접근하면 됩니다.

## Phaser Scene 다루기

Phaser에서 Scene은 게임의 심장과도 같습니다. 스프라이트, 게임 로직, Phaser 시스템 전반이 Scene 위에서 동작하며 여러 Scene을 동시에 돌릴 수도 있습니다. 이 템플릿은 React에서 현재 활성 Scene을 가져오는 통로를 제공합니다.

`PhaserGame` 컴포넌트의 `currentActiveScene` 콜백을 통해 현재 Scene을 받을 수 있습니다. 이를 위해서는 Phaser Scene 쪽에서 `EventBus`로 `"current-scene-ready"` 이벤트를 발행해야 합니다. 템플릿의 모든 Scene이 이 패턴을 따릅니다.

**중요:** 새 Scene을 추가할 때는 아래처럼 `EventBus`로 `"current-scene-ready"`를 발행해 React에 노출하세요.

```ts
class MyScene extends Phaser.Scene
{
    constructor ()
    {
        super('MyScene');
    }

    create ()
    {
        // 게임 오브젝트와 로직

        // create 끝부분에서:
        EventBus.emit('current-scene-ready', this);
    }
}
```

React에서 특정 Scene에 접근할 필요가 없다면 이벤트를 발행하지 않아도 됩니다. 또한 반드시 `create` 끝에서 발행할 필요도 없습니다. 예를 들어 네트워크 응답을 기다린 뒤에 발행해도 됩니다.

### React 컴포넌트 사용 예시

React 컴포넌트에서 Phaser 데이터에 접근하는 예시입니다.

```ts
import { useRef } from 'react';
import { IRefPhaserGame } from "./PhaserGame";

const ReactComponent = () => {

    const phaserRef = useRef<IRefPhaserGame>(null); // phaserRef.current로 접근

    const onCurrentActiveScene = (scene: Phaser.Scene) => {
        // Scene 변경 시 호출됨
    }

    return (
        <PhaserGame ref={phaserRef} currentActiveScene={onCurrentActiveScene} />
    );
}
```

위 코드처럼 `useRef()`로 만든 ref를 `PhaserGame`에 연결하면, `phaserRef.current.game`에서 Phaser 게임 인스턴스를, `phaserRef.current.scene`에서 가장 최근 활성 Scene을 얻을 수 있습니다.

`onCurrentActiveScene` 콜백은 EventBus에서 `"current-scene-ready"`가 발행될 때마다 호출됩니다.

## 에셋 관리

오디오, 이미지, 비디오 등 정적 게임 파일은 `public/assets` 폴더에 두세요. Phaser Loader에서 다음과 같이 참조할 수 있습니다.

```ts
preload ()
{
    // public/assets 폴더의 이미지 로드 예시
    this.load.image('background', 'assets/bg.png');
}
```

`npm run build`를 실행하면 정적 에셋이 `dist/assets` 폴더로 자동 복사됩니다.

## 프로덕션 배포

`npm run build`를 돌리면 코드가 번들링되어 `dist` 폴더에 저장되고, 프로젝트에서 import한 자산이나 `public` 폴더의 자산도 함께 출력됩니다. `next.config.mjs`에서 `output: 'export'`로 설정되어 있어 결과물은 **정적 사이트**입니다.

게임을 배포하려면 `dist` 폴더의 *모든* 내용을 외부에 노출되는 정적 웹 서버에 업로드하면 됩니다.

## 템플릿 커스터마이징

### Next.js

CSS·폰트 로더 등 빌드 설정을 바꾸고 싶다면 `next.config.mjs`를 수정하세요. 별도 설정 파일을 만들어 `package.json`의 npm 스크립트에서 타깃팅할 수도 있습니다. 자세한 내용은 [Next.js 공식 문서](https://nextjs.org/docs)를 참고하세요.

## log.js에 대하여

`log.js`는 Phaser Studio Inc. 소유 도메인인 `gryzor.co`로 조용히 한 번 API 호출을 보냅니다. 전송되는 데이터는 3가지뿐입니다.

1. 사용 중인 템플릿 이름 (vue, react 등)
2. 빌드 유형 — `dev` 또는 `prod`
3. 사용 중인 Phaser 버전

개인정보는 어떤 것도 수집·전송되지 않습니다. 프로젝트 파일, 기기, 브라우저 정보도 보지 않습니다. `log.js` 파일을 직접 열어 확인할 수 있습니다.

왜 수집할까요? 오픈소스다 보니 어떤 템플릿이 실제로 쓰이는지 알 길이 없습니다. 이 익명 신호가 어떤 템플릿에 투자할 가치가 있는지 판단하는 데 도움이 됩니다.

데이터를 보내고 싶지 않다면 다음 명령을 쓰세요.

개발:

```bash
npm run dev-nolog
```

빌드:

```bash
npm run build-nolog
```

또는 `log.js` 파일을 삭제하고 `package.json`의 `scripts` 섹션에서 호출 부분을 제거하면 완전히 비활성화됩니다.

변경 전:

```json
"scripts": {
    "dev": "node log.js dev & dev-template-script",
    "build": "node log.js build & build-template-script"
},
```

변경 후:

```json
"scripts": {
    "dev": "dev-template-script",
    "build": "build-template-script"
},
```

## Phaser 커뮤니티

**웹사이트:** [Phaser](https://phaser.io) · [Phaser Twitter](https://twitter.com/phaser_)
**플레이:** [#madewithphaser](https://twitter.com/search?q=%23madewithphaser&src=typed_query&f=live)
**학습:** [API 문서](https://newdocs.phaser.io) · [포럼](https://phaser.discourse.group/) · [StackOverflow](https://stackoverflow.com/questions/tagged/phaser-framework)
**Discord:** [Phaser Discord](https://discord.gg/phaser)
**예제:** 2000+ [Examples](https://labs.phaser.io)
**뉴스레터:** [Phaser World](https://phaser.io/community/newsletter)

원본 템플릿 제작: [Phaser Studio](mailto:support@phaser.io).

Phaser 로고와 캐릭터는 © 2011 - 2025 Phaser Studio Inc. 모든 권리 보유.
