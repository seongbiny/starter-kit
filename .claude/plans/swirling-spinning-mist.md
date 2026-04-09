# Phaser HTML5 게임 스타터 키트 마이그레이션 플랜

## Context

현재 프로젝트는 **PixiJS v8** 기반 HTML5 게임 스타터 키트다.  
사용자는 이를 **Phaser 3** 기반으로 교체하여 초기화·렌더링·이벤트 처리가 갖춰진 최소 스타터 키트를 원한다.

PixiJS는 렌더링 전용 라이브러리로 SceneManager, AssetManager, InputManager를 직접 구현했지만,  
Phaser는 씬 생명주기(preload/create/update), 에셋 로더, 입력 시스템, 아케이드 물리가 내장된 풀 게임 프레임워크다.  
따라서 커스텀 매니저 클래스 대부분이 제거되고 Phaser 내장 기능으로 대체된다.

**React/Zustand/Supabase 레이어는 그대로 유지**하고 게임 엔진 레이어만 교체한다.

---

## 삭제할 파일 (Phaser 내장 기능으로 대체)

| 파일 | 대체 이유 |
|------|-----------|
| `src/game/scenes/BaseScene.ts` | `Phaser.Scene` 내장 생명주기로 대체 |
| `src/game/scenes/SceneManager.ts` | `this.scene.start()` Phaser 내장으로 대체 |
| `src/game/managers/AssetManager.ts` | `this.load.*` Phaser 로더로 대체 |
| `src/game/managers/InputManager.ts` | `this.input.keyboard.*` Phaser 입력으로 대체 |
| `src/game/entities/Entity.ts` | `Phaser.GameObjects.GameObject` 기반으로 대체 |
| `src/game/entities/Player.ts` | Phaser 물리 스프라이트 기반 Player로 재작성 |

---

## 수정할 파일

### 1. `package.json`
```bash
npm uninstall pixi.js
npm install phaser
```
Phaser는 자체 타입 포함 → `@types/phaser` 불필요

### 2. `vite.config.ts` (L23)
```ts
// 변경 전
if (id.includes('pixi.js')) return 'pixi'
// 변경 후
if (id.includes('phaser')) return 'phaser'
```

### 3. `src/types/game.types.ts`
- **삭제**: `IScene`, `AssetEntry`, `AssetType`, `InputState` (PixiJS 전용)
- **수정**: `GameConfig` — PixiJS 전용 필드(`backgroundColor: number`, `antialias`, `resolution`) 제거, Phaser용으로 재정의
- **추가**: `SceneKey` 유니온 타입 (타입 안전한 씬 참조)

```ts
export type SceneKey = 'PreloadScene' | 'GameScene'

export interface GameConfig {
  width: number
  height: number
  backgroundColor: string  // '#0f0f1a' 형식
}
```

### 4. `src/hooks/useGameCanvas.ts`
- `void gameApp.mount(container).then()` → 동기 호출로 변경  
  (Phaser `new Phaser.Game()` 생성자는 동기, PixiJS `app.init()`과 달리 async 불필요)

```ts
useEffect(() => {
  const container = containerRef.current
  if (!container) return
  const gameApp = GameApp.getInstance()
  gameApp.mount(container)   // 동기
  return () => { gameApp.unmount() }
}, [])
```

---

## 새로 작성할 파일

### `src/game/GameApp.ts` (전면 재작성)

Phaser.Game 싱글턴 + Zustand 브릿지

```ts
export class GameApp {
  private static instance: GameApp | null = null
  private game: Phaser.Game | null = null

  static getInstance(): GameApp { ... }

  mount(container: HTMLElement): void {
    if (this.game) {           // StrictMode 이중 실행 방어
      container.appendChild(this.game.canvas)
      return
    }
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: container,       // React ref div에 캔버스 삽입
      width: 800,
      height: 600,
      backgroundColor: '#0f0f1a',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [PreloadScene, GameScene],
      banner: false,
    })
    this.setupStoreBridges()
  }

  unmount(): void {
    this.game?.canvas.remove()
  }

  destroy(): void {
    this.game?.destroy(true)
    this.game = null
    GameApp.instance = null
  }

  private setupStoreBridges(): void {
    // Zustand → Phaser: isPaused 변경 시 씬 일시정지/재개
    useGameStore.subscribe(
      (state) => state.isPaused,
      (isPaused) => {
        isPaused
          ? this.game?.scene.pause('GameScene')
          : this.game?.scene.resume('GameScene')
      }
    )
    // Zustand → Phaser: 게임오버 시 씬 정지
    useGameStore.subscribe(
      (state) => state.isGameOver,
      (isGameOver) => {
        if (isGameOver) this.game?.scene.pause('GameScene')
      }
    )
  }
}
```

### `src/game/scenes/PreloadScene.ts`

```ts
export class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }) }

  preload(): void {
    useUiStore.getState().setLoading(true)

    this.load.on('progress', (value: number) => {
      useUiStore.getState().setLoadingProgress(Math.floor(value * 100))
    })
    this.load.on('complete', () => {
      useUiStore.getState().setLoading(false)
    })

    // 에셋 로드 예시 (교체 가능):
    // this.load.image('player', '/assets/sprites/player.png')
  }

  create(): void {
    this.scene.start('GameScene')
  }
}
```

### `src/game/scenes/GameScene.ts`

```ts
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>
  private scoreTimer = 0
  private unsubscribes: Array<() => void> = []

  constructor() { super({ key: 'GameScene' }) }

  create(): void {
    useGameStore.getState().resetGame()
    useGameStore.getState().setStatus('playing')

    // 플레이어 (스프라이트 교체 전 사각형 플레이스홀더)
    this.player = this.add.rectangle(400, 300, 40, 40, 0x6366f1)
    this.physics.add.existing(this.player)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)

    // 키보드 입력
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    // ESC → Zustand isPaused 토글 (단방향: Phaser → Zustand → GameApp → scene.pause)
    this.input.keyboard!.on('keydown-ESC', () => {
      const { isPaused, setPaused } = useGameStore.getState()
      setPaused(!isPaused)
    })
  }

  update(_time: number, _delta: number): void {
    const { isPaused, isGameOver } = useGameStore.getState()
    if (isPaused || isGameOver) return

    const body = this.player.body as Phaser.Physics.Arcade.Body
    const speed = 200
    body.setVelocity(0)

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  body.setVelocityX(-speed)
    if (this.cursors.right.isDown || this.wasd.right.isDown) body.setVelocityX(speed)
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    body.setVelocityY(-speed)
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  body.setVelocityY(speed)

    // 60프레임마다 점수 증가 (예시)
    this.scoreTimer++
    if (this.scoreTimer >= 60) {
      this.scoreTimer = 0
      useGameStore.getState().addScore(10)
    }
  }

  shutdown(): void {
    // Phaser 내장 생명주기 훅 — scene.start() 시 자동 호출
    this.unsubscribes.forEach((u) => u())
    this.unsubscribes = []
  }
}
```

---

## 변경 없는 파일

다음은 **손대지 않는다**:

- `src/components/game/GameCanvas.tsx` — `containerRef` 패턴 동일
- `src/components/game/GameHUD.tsx` — Zustand만 읽음
- `src/components/game/GameOverModal.tsx`
- `src/components/game/PauseMenu.tsx`
- `src/components/layout/GameLayout.tsx`
- `src/game/managers/AudioManager.ts` — Howler.js 유지
- `src/stores/*` — 4개 스토어 전부
- `src/pages/*`
- `src/lib/*`

---

## 아키텍처 비교

```
[기존 PixiJS]
GameApp → Application(async init) → SceneManager → BaseScene → SceneManager.ticker
                                  → AssetManager (PixiJS Assets API)
                                  → InputManager (직접 구현)

[새로운 Phaser]
GameApp → new Phaser.Game(sync) → PreloadScene(preload/create) → GameScene(create/update)
                                  Phaser.Loader 내장              Phaser.Input 내장
                                  Phaser.Scene 내장 전환          Phaser.Physics 내장
```

---

## 검증 단계

1. **패키지 확인**: `package.json`에 `"phaser"` 있고 `"pixi.js"` 없음
2. **타입 체크**: `npx tsc -b --noEmit` → 에러 0
3. **개발 서버**: `npm run dev` → 게임 라우트에서 Phaser 캔버스 렌더링 확인
4. **브릿지 검증**:
   - ESC 키 → PauseMenu 표시 & Phaser 씬 루프 정지
   - 계속하기 → 씬 재개 & 플레이어 이동
5. **빌드 확인**: `npm run build` → `dist/assets/`에 `phaser-[hash].js` 존재, `pixi` 청크 없음
6. **잔존 참조 확인**: `grep -r "pixi" src/ --include="*.ts" --include="*.tsx"` → 결과 0
