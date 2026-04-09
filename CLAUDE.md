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

---

## 전체 아키텍처

**Vite + React 19 SPA.** Next.js가 아님. 라우팅은 React Router v7.

```
브라우저
  └── React Router (/, /game, /leaderboard)
        └── GamePage
              └── GameLayout
                    ├── GameCanvas   ── Phaser 캔버스 (zIndex: 1)
                    ├── GameHUD      ── React 오버레이 (zIndex: 2)
                    ├── PauseMenu    ── ESC 시 표시
                    └── GameOverModal
```

두 레이어가 같은 화면에 겹쳐 있음:
- **Phaser 레이어**: 게임 오브젝트, 물리, 애니메이션
- **React 레이어**: HUD, 메뉴, 모달 — Zustand 스토어를 읽어 렌더링

---

## 1. 초기화 (Initialization)

### 흐름 전체

```
React 렌더 완료
  → useEffect 실행 (= window.onload 역할)
  → GameApp.getInstance().mount(container)
  → new Phaser.Game({ parent: container, ... })
  → Phaser 내부 부트 (WebGL 컨텍스트 생성)
  → scene 배열 순서대로 씬 등록
  → PreloadScene 자동 시작
```

### GameApp 싱글턴 (`src/game/GameApp.ts`)

`GameApp`은 프로세스 내 인스턴스가 하나만 존재함.
React StrictMode가 `useEffect`를 두 번 실행해도 `this.game`이 이미 있으면 캔버스만 재삽입하고 종료.

```
mount() 호출 시:
  ① this.game 존재 → canvas 재삽입 후 return (StrictMode 방어)
  ② this.game 없음 → new Phaser.Game(...) 생성
                    → setupStoreBridges()  (Zustand 구독)
                    → blockBrowserDefaults()  (브라우저 기본 동작 차단)
```

**Phaser.Game 핵심 설정값:**

| 항목 | 값 | 이유 |
|------|----|------|
| `type` | `Phaser.AUTO` | WebGL 우선, Canvas 폴백 |
| `width / height` | `1280 / 720` | 16:9 논리 해상도 |
| `scale.mode` | `Phaser.Scale.FIT` | 화면 비율 유지하며 최대 크기 |
| `scale.autoCenter` | `CENTER_BOTH` | 화면 중앙 정렬 |
| `scale.zoom` | `Math.min(devicePixelRatio, 2)` | 레티나 선명 렌더링, 3+ 디바이스는 2로 캡 |
| `physics.default` | `'arcade'` | 내장 물리 엔진 |
| `banner` | `false` | 콘솔 배너 제거 |

### 씬 초기화 순서

```
Phaser.Game 생성
  → PreloadScene 등록 및 자동 시작
      preload(): 에셋 등록 → Phaser Loader가 비동기 로드
                             진행률 → useUiStore.setLoadingProgress()
      create(): this.scene.start('GameScene')
  → GameScene 시작
      create(): 게임 오브젝트, 입력, 리사이즈, 포인터 이벤트 초기화
      update(): 매 프레임 실행
```

### 에셋 로딩 + React 로딩 UI 연결

`PreloadScene.preload()`에 에셋을 등록하면 Phaser Loader가 자동으로 비동기 처리한다.
진행률은 Zustand `uiStore`로 흘러가 React 컴포넌트에서 표시할 수 있다.

```ts
// PreloadScene.ts
this.load.on('progress', (value: number) => {
  useUiStore.getState().setLoadingProgress(Math.floor(value * 100))
})

// 에셋 등록 (public/assets/ 하위에 파일 배치)
this.load.image('background', '/assets/sprites/background.png')
this.load.spritesheet('player', '/assets/sprites/player.png', {
  frameWidth: 32, frameHeight: 48,
})
this.load.audio('bgm', '/assets/audio/bgm.mp3')
```

React 로딩 오버레이에서 읽는 방법:
```tsx
const isLoading = useUiStore((s) => s.isLoading)       // true/false
const progress  = useUiStore((s) => s.loadingProgress) // 0~100
```

---

## 2. 렌더링 (Rendering)

### 화면 비율 유지 + DPR 처리

Phaser Scale Manager가 아래 작업을 자동 수행한다:

```
window resize / 기기 회전 감지
  → 뷰포트 크기 측정
  → 1280×720 비율 유지하며 최대 fit 크기 계산
  → canvas CSS 크기 설정 (display size)
  → zoom(DPR)배로 내부 버퍼 확대 → 레티나 선명 렌더링
  → CENTER_BOTH로 화면 중앙 정렬
  → 'resize' 이벤트 발생 → GameScene.setupResize() 콜백 실행
```

DPR 동작 원리 (예: DPR=2, 화면=1920×1080):
```
논리 해상도:    1280 × 720   (게임 좌표계)
내부 버퍼:      2560 × 1440  (zoom:2 적용, 실제 렌더 품질)
CSS 표시 크기:  1920 × 1080  (FIT 스케일 적용)
결과:           레티나 선명, 비율 유지, 중앙 정렬
```

### 씬 내 레이어 분리

Phaser는 단일 canvas에서 내부 depth로 레이어를 관리한다. 레이어 분리는 `Phaser.GameObjects.Layer`로 처리:

```ts
// GameScene.create() 내부
const bgLayer     = this.add.layer()  // depth 0 — 배경
const charLayer   = this.add.layer()  // depth 1 — 캐릭터
const effectLayer = this.add.layer()  // depth 2 — 이펙트

bgLayer.add(this.add.image(640, 360, 'background'))
charLayer.add(this.physics.add.sprite(640, 360, 'player'))
effectLayer.add(this.add.particles(0, 0, 'spark', { ... }))
```

React HUD(`GameHUD`, `PauseMenu`)는 별도 DOM 레이어로 Phaser canvas 위에 올라감 (zIndex 2).
다중 canvas를 쌓는 바닐라 JS 패턴은 Phaser에서 사용하지 않는다.

### Zustand ↔ Phaser 브릿지 (단방향)

씬 내부에서 `scene.pause()`를 직접 호출하지 않는다.
항상 Zustand 상태를 변경하면 `GameApp.setupStoreBridges()`가 Phaser를 제어한다.

```
Phaser 이벤트 감지 (ESC 키 등)
  → useGameStore.setState({ isPaused: true })
  → setupStoreBridges() 구독 콜백 실행
  → game.scene.pause('GameScene')   ← Phaser 루프 정지
  → React PauseMenu 렌더 (isPaused 읽어서)
```

---

## 3. 이벤트 처리 (Event Handling)

### 키보드

```ts
// 방향키 + WASD 동시 지원
this.cursors = this.input.keyboard!.createCursorKeys()
this.wasd = {
  up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
  down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
  left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
  right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
}

// update() 내에서 매 프레임 폴링
if (this.cursors.left.isDown || this.wasd.left.isDown) { ... }

// 특정 키 이벤트
this.input.keyboard!.on('keydown-ESC', () => { ... })
this.input.keyboard!.on('keydown-SPACE', () => { ... })
```

방향키·스페이스바의 페이지 스크롤은 `GameApp.blockBrowserDefaults()`에서 전역 차단.

### 마우스 / 터치 통합 (Pointer API)

Phaser `Pointer`가 `mousedown`/`touchstart` 분기를 내부 처리한다.
`p.x`, `p.y`는 게임 논리 좌표(DPR·스케일 보정 완료)로 바로 사용 가능하다.

```ts
// PC 마우스와 모바일 터치를 동일하게 처리
this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
  if (p.rightButtonDown()) return  // 우클릭 무시
  // p.x, p.y: 게임 좌표
})

this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
  if (!p.isDown) return  // 누른 상태(드래그)에서만
})

this.input.on('pointerup', (_p: Phaser.Input.Pointer) => { ... })
```

모바일 판별이 필요한 경우:
```ts
const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS
```

### 브라우저 기본 동작 차단 목록

| 차단 항목 | 처리 위치 | 방법 |
|-----------|-----------|------|
| 휠 스크롤 | `GameApp` Phaser config | `input.mouse.preventDefaultWheel: true` |
| 마우스 기본 동작 | `GameApp` Phaser config | `preventDefaultDown/Up/Move: true` |
| 방향키·스페이스 스크롤 | `GameApp.blockBrowserDefaults()` | `keydown` + `preventDefault` |
| 우클릭 메뉴 (전역) | `GameApp.blockBrowserDefaults()` | canvas `contextmenu` 차단 |
| 우클릭 메뉴 (씬) | `GameScene.setupPointerEvents()` | `input.mouse.disableContextMenu()` |
| 핀치줌·패닝 | `GameCanvas.tsx` 컨테이너 | `touchAction: 'none'` |
| 텍스트 선택 | `GameCanvas.tsx` 컨테이너 | `userSelect: 'none'` |

---

## 상태 관리 (Zustand stores)

| 스토어 | persist | localStorage 키 | 저장 내용 |
|--------|:-------:|:---------------:|-----------|
| `gameStore` | ❌ | — | score, level, lives, isPaused, isGameOver (세션 전용) |
| `uiStore` | ❌ | — | currentScreen, isLoading, loadingProgress |
| `playerStore` | ✅ | `player-data` | nickname, bestScore |
| `audioStore` | ✅ | `audio-settings` | bgmVolume, sfxVolume, isMuted |
| `progressStore` | ✅ | `game-progress` | highestLevel, unlockedStages, difficulty, 통계 |

`gameStore`와 `uiStore`는 `subscribeWithSelector` 미들웨어 사용 → Phaser 브릿지에서 선택적 구독.

**progressStore 사용 패턴:**
```ts
useProgressStore.getState().recordSession(elapsedSeconds)    // 1판 종료 시
useProgressStore.getState().updateHighestLevel(clearedLevel) // 레벨 클리어 시
useProgressStore.getState().unlockStage(clearedLevel + 1)    // 다음 스테이지 해금
useProgressStore.getState().setDifficulty('hard')            // 난이도 변경
```

---

## 오디오

`AudioManager` (Howler.js)는 `GameApp` 싱글턴에 포함. `audioStore` 변경을 구독해 볼륨/음소거 자동 동기화.

```ts
gameApp.audioManager.register('bgm', '/assets/audio/bgm.mp3', true) // loop
gameApp.audioManager.playBgm('bgm')   // 페이드인 재생, 이전 BGM 페이드아웃
gameApp.audioManager.playSfx('jump')  // 원샷 효과음
```

---

## 새 씬 추가 체크리스트

1. `src/game/scenes/MyScene.ts` 생성 (`extends Phaser.Scene`)
2. `GameApp.ts` → `scene: [PreloadScene, GameScene, MyScene]` 배열에 추가
3. `src/types/game.types.ts` → `SceneKey` 유니온에 `'MyScene'` 추가
4. 씬 전환: `this.scene.start('MyScene')` (씬 내부에서 직접 호출 가능)

---

## 경로 별칭

```ts
@/*      → src/*
@game/*  → src/game/*
```

## 빌드 청크

Vite가 `phaser`, `supabase`, `vendor`(React 계열)를 별도 청크로 분리.
새 대용량 라이브러리 추가 시 `vite.config.ts`의 `manualChunks`에 추가 고려.

## 코딩 규칙

- `any` 타입 사용 금지 (tsconfig strict 모드)
- Phaser physics body 캐스트: `this.player.body as Phaser.Physics.Arcade.Body` — 불가피하며 의도된 패턴
- 씬 내부에서 `scene.pause()` 직접 호출 금지 — Zustand 상태 변경 후 브릿지에 위임
- 컴포넌트 PascalCase, 훅 `use` 접두사
- 스타일: Tailwind CSS v4 (PostCSS 아닌 Vite 플러그인 방식)
- 백엔드: Supabase (`src/lib/supabase.ts`), 리더보드 조회는 `useLeaderboard()` TanStack Query 훅
