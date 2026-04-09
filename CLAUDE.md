# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev        # 개발 서버 (Vite HMR)
npm run build      # 프로덕션 빌드 (tsc -b && vite build)
npm run lint       # ESLint
npx tsc --noEmit   # 타입 체크만 (빌드 없이)
```

테스트 러너는 설정되어 있지 않음.

## 아키텍처 개요

**Vite + React 19 SPA.** Next.js가 아님. 라우팅은 React Router v7.

```
React Router (/, /game, /leaderboard)
  ↓
GamePage → GameLayout
  ├── GameCanvas (Phaser 캔버스 마운트)   ← zIndex: 1
  ├── GameHUD (React 오버레이)             ← zIndex: 2
  ├── PauseMenu (ESC 시 표시)
  └── GameOverModal
```

### Phaser ↔ React 브릿지 패턴

`GameApp` 싱글턴이 `Phaser.Game` 인스턴스를 보유. React는 `useGameCanvas()` 훅으로 컨테이너 div를 생성하고, `GameApp.mount(container)`를 호출해 Phaser 캔버스를 그 div 안에 삽입.

```
useGameCanvas() → GameApp.getInstance().mount(containerRef) → new Phaser.Game({ parent: container })
```

**React StrictMode 이중 실행 방어:** `GameApp.mount()`는 `this.game`이 이미 존재하면 캔버스를 재삽입만 하고 종료.

### Zustand ↔ Phaser 브릿지 (단방향 흐름)

```
Phaser 감지 (예: ESC 키) → useGameStore.setState() → GameApp.setupStoreBridges() → game.scene.pause()
```

`GameApp.setupStoreBridges()`는 `subscribeWithSelector`를 사용해 `isPaused`/`isGameOver` 변경을 감지, Phaser 씬을 직접 제어. 씬 내부에서 `scene.pause()`를 직접 호출하지 말 것 — Zustand 상태를 변경하면 브릿지가 처리함.

### Phaser 씬 구조

```
PreloadScene → GameScene
```

- `PreloadScene.preload()`: 에셋 로드, 진행률 → `useUiStore.setLoadingProgress()`
- `PreloadScene.create()`: `this.scene.start('GameScene')`
- `GameScene.create()`: 게임 오브젝트 초기화, 입력 설정
- `GameScene.update()`: 매 프레임 로직 (Zustand에서 `isPaused`/`isGameOver` 확인 후 조기 return)
- `GameScene.shutdown()`: Phaser 내장 생명주기 훅, `scene.start()` 시 자동 호출

새 씬 추가 시 `GameApp.ts`의 `scene: [PreloadScene, GameScene]` 배열에 추가하고, `src/types/game.types.ts`의 `SceneKey` 유니온 타입에도 추가.

### 상태 관리 (Zustand stores)

| 스토어 | 역할 |
|--------|------|
| `gameStore` | score, level, lives, isPaused, isGameOver, status |
| `uiStore` | currentScreen, isLoading, loadingProgress |
| `audioStore` | bgmVolume, sfxVolume, isMuted |
| `playerStore` | nickname, bestScore |

`gameStore`와 `uiStore`는 `subscribeWithSelector` 미들웨어 사용 → 선택적 구독 가능.

### 오디오

`AudioManager` (Howler.js)는 `GameApp` 싱글턴에 포함. `audioStore` 변경을 구독해 볼륨/음소거를 자동 동기화.

```typescript
gameApp.audioManager.register('bgm', '/assets/audio/bgm.mp3', true)
gameApp.audioManager.playBgm('bgm')
gameApp.audioManager.playSfx('jump')
```

### 백엔드

Supabase: `src/lib/supabase.ts`. 리더보드 조회는 `useLeaderboard()` TanStack Query 훅.

## 경로 별칭

```typescript
@/*      → src/*
@game/*  → src/game/*
```

## 빌드 청크

Vite가 `phaser`, `supabase`, `vendor`(React 계열)를 별도 청크로 분리. 새 대용량 라이브러리 추가 시 `vite.config.ts`의 `manualChunks`에 추가 고려.

## 코딩 규칙

- `any` 타입 사용 금지 (tsconfig strict 모드)
- Phaser physics body 캐스트: `this.player.body as Phaser.Physics.Arcade.Body` — 이 패턴은 불가피하며 의도된 것
- 컴포넌트는 PascalCase, 훅은 `use` 접두사
- 스타일: Tailwind CSS v4 (PostCSS 아닌 Vite 플러그인 방식)
