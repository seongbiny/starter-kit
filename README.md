# HTML5 게임 스타터 키트

Phaser 3 + React 19 + TypeScript로 구성된 HTML5 게임 개발 스타터 키트입니다.
게임 엔진 세팅, 반응형 화면, 입력 처리, 상태 관리, 데이터 저장, 오디오, 온라인 리더보드까지
반복되는 보일러플레이트를 미리 구성해두어 게임 로직 개발에만 집중할 수 있습니다.

---

## 기술 스택

| 역할 | 라이브러리 |
|------|-----------|
| 게임 엔진 | Phaser 3 |
| UI 프레임워크 | React 19 |
| 언어 | TypeScript (strict) |
| 빌드 도구 | Vite |
| 라우팅 | React Router v7 |
| 상태 관리 | Zustand v5 |
| UI 컴포넌트 | shadcn/ui + Tailwind CSS v4 |
| 오디오 | Howler.js |
| 백엔드 / 리더보드 | Supabase |
| 서버 상태 | TanStack Query v5 |
| 폼 | React Hook Form + Zod |

---

## 주요 기능

### 게임 엔진
- **Phaser 3** WebGL/Canvas 렌더링 (자동 폴백)
- **16:9 논리 해상도** (1280×720) 기반 고정 좌표계
- **DPR 대응**: 레티나·고해상도 디스플레이에서 선명한 렌더링 (최대 2배율 캡)
- **반응형 스케일링**: 화면 비율 유지 + 중앙 정렬 (모든 디바이스)
- **기기 회전 대응**: resize 이벤트 시 카메라 뷰포트 자동 재조정
- **아케이드 물리** 내장

### 입력 처리
- **키보드**: 방향키 + WASD 동시 지원, 커스텀 키 바인딩
- **마우스 + 터치 통합**: `Pointer` API로 플랫폼 분기 없이 동일하게 처리
- **브라우저 기본 동작 차단**: 우클릭 메뉴, 휠 스크롤, 방향키 스크롤, 핀치줌, 텍스트 선택

### 상태 관리 (Zustand)
| 스토어 | localStorage | 내용 |
|--------|:------------:|------|
| `gameStore` | ❌ | 점수, 목숨, 레벨, 일시정지, 게임오버 (세션) |
| `uiStore` | ❌ | 현재 화면, 로딩 상태/진행률 |
| `playerStore` | ✅ | 닉네임, 최고점수 |
| `audioStore` | ✅ | BGM/SFX 볼륨, 음소거 |
| `progressStore` | ✅ | 레벨 진행도, 잠금해제, 난이도, 통계 |

### 오디오
- BGM 페이드인/페이드아웃 전환
- SFX 원샷 재생
- 볼륨·음소거 자동 동기화 (audioStore 연동)

### 온라인 리더보드
- Supabase 연동 점수 제출 / 조회
- TanStack Query 캐싱

---

## 시작하기

### 요구사항
- Node.js 18+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 빌드

```bash
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

---

## 환경 변수 설정

리더보드 기능을 사용하려면 Supabase 프로젝트가 필요합니다.
프로젝트 루트에 `.env.local` 파일을 생성하세요.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

리더보드 없이 개발만 할 경우 설정하지 않아도 됩니다.

---

## 프로젝트 구조

```
src/
├── game/                        # Phaser 게임 엔진 레이어
│   ├── GameApp.ts               # Phaser.Game 싱글턴, Zustand 브릿지
│   ├── scenes/
│   │   ├── PreloadScene.ts      # 에셋 로딩 씬 (여기에 에셋 등록)
│   │   └── GameScene.ts         # 메인 게임 씬 (여기에 게임 로직)
│   └── managers/
│       └── AudioManager.ts      # Howler.js 오디오 래퍼
│
├── components/
│   ├── game/
│   │   ├── GameCanvas.tsx       # Phaser 캔버스 마운트 컴포넌트
│   │   ├── GameHUD.tsx          # React HUD 오버레이 (점수, 목숨)
│   │   ├── PauseMenu.tsx        # 일시정지 메뉴
│   │   └── GameOverModal.tsx    # 게임오버 모달
│   └── ui/                      # shadcn/ui 기본 컴포넌트
│
├── stores/                      # Zustand 상태 스토어
│   ├── gameStore.ts
│   ├── uiStore.ts
│   ├── audioStore.ts
│   ├── playerStore.ts
│   └── progressStore.ts
│
├── hooks/
│   ├── useGameCanvas.ts         # React ↔ Phaser 마운트 브릿지
│   └── useLeaderboard.ts        # 리더보드 TanStack Query 훅
│
├── pages/
│   ├── MenuPage.tsx
│   ├── GamePage.tsx
│   └── LeaderboardPage.tsx
│
├── lib/
│   └── supabase.ts              # Supabase 클라이언트
│
└── types/
    └── game.types.ts            # 전역 TypeScript 타입
```

---

## 게임 만드는 법

### 1. 에셋 등록

`public/assets/` 폴더에 파일을 넣고 `PreloadScene.ts`에 등록합니다.

```ts
// src/game/scenes/PreloadScene.ts
preload(): void {
  // ... (기존 코드 유지)

  this.load.image('background', '/assets/sprites/background.png')
  this.load.spritesheet('player', '/assets/sprites/player.png', {
    frameWidth: 48,
    frameHeight: 48,
  })
  this.load.audio('bgm', '/assets/audio/bgm.mp3')
  this.load.audio('jump', '/assets/audio/jump.mp3')
}
```

### 2. 게임 오브젝트 초기화

`GameScene.ts`의 `create()`에서 배경, 플레이어, 적 등을 생성합니다.

```ts
// src/game/scenes/GameScene.ts
create(): void {
  // ... (기존 코드 유지)

  // 배경
  this.add.image(640, 360, 'background')

  // 물리 스프라이트로 플레이어 교체
  this.player = this.physics.add.sprite(640, 360, 'player')
  this.player.setCollideWorldBounds(true)

  // BGM 시작
  GameApp.getInstance().audioManager.register('bgm', '/assets/audio/bgm.mp3', true)
  GameApp.getInstance().audioManager.playBgm('bgm')
}
```

### 3. 매 프레임 로직

`update()`는 초당 60번 자동 호출됩니다.

```ts
update(_time: number, _delta: number): void {
  const { isPaused, isGameOver } = useGameStore.getState()
  if (isPaused || isGameOver) return  // 이 두 줄은 유지

  this.handleMovement()
  this.handleCollisions()
}
```

### 4. 점수 / 상태 변경

```ts
useGameStore.getState().addScore(100)     // 점수 추가
useGameStore.getState().loseLife()        // 목숨 감소 (0이 되면 자동 게임오버)
useGameStore.getState().setLevel(2)       // 레벨 변경
```

### 5. 진행도 저장

```ts
// 1판 종료 시
useProgressStore.getState().recordSession(elapsedSeconds)
usePlayerStore.getState().updateBestScore(currentScore)

// 레벨 클리어 시
useProgressStore.getState().updateHighestLevel(level)
useProgressStore.getState().unlockStage(level + 1)
```

### 6. 새 씬 추가

```ts
// 1. src/game/scenes/BossScene.ts 생성
export class BossScene extends Phaser.Scene {
  constructor() { super({ key: 'BossScene' }) }
  create() { ... }
  update() { ... }
}

// 2. GameApp.ts 배열에 추가
scene: [PreloadScene, GameScene, BossScene]

// 3. game.types.ts SceneKey에 추가
export type SceneKey = 'PreloadScene' | 'GameScene' | 'BossScene'

// 4. 씬 전환
this.scene.start('BossScene')
```

---

## 화면 구조

```
GamePage
  ├── [Phaser Canvas]   z-index: 1  ← 게임 오브젝트, 물리, 애니메이션
  └── [React Layer]     z-index: 2  ← HUD, 메뉴, 모달 (Zustand 읽어서 렌더)
```

Phaser와 React가 같은 Zustand 스토어를 공유합니다.
Phaser → Zustand 상태 변경 → React UI 자동 업데이트.

---

## 라이선스

MIT
