# 입력 이벤트 처리 강화 플랜

## Context

PC(마우스)와 모바일(터치) 입력을 통합 처리하고, 게임 중 발생하는 브라우저 기본 동작
(우클릭 메뉴, 휠 스크롤, 방향키 스크롤, 텍스트 선택 등)을 차단해야 한다.
Phaser의 통합 포인터 API를 활용해 플랫폼별 분기 없이 동일한 코드로 처리한다.

---

## 수정할 파일 (3개)

### 1. `src/game/GameApp.ts`

**추가 위치:** `new Phaser.Game({...})` 설정 객체 내 + `mount()` 끝

```ts
// Phaser config에 input 추가
input: {
  mouse: {
    preventDefaultDown: true,   // 마우스다운 기본 동작 차단
    preventDefaultUp: true,
    preventDefaultMove: true,
    preventDefaultWheel: true,  // 휠 스크롤 차단
  },
},
```

```ts
// mount() 끝에서 호출
this.setupStoreBridges()
this.blockBrowserDefaults()   // ← 추가
```

```ts
// 새 private 메서드
private blockBrowserDefaults(): void {
  // 방향키·스페이스로 인한 페이지 스크롤 차단
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      const blocked = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']
      if (blocked.includes(e.code)) e.preventDefault()
    },
    { passive: false }
  )

  // 캔버스 우클릭 컨텍스트 메뉴 차단
  this.game?.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
}
```

### 2. `src/components/game/GameCanvas.tsx`

컨테이너 div에 브라우저 기본 제스처 차단 CSS 추가:

```tsx
<div
  ref={containerRef}
  className="absolute inset-0 overflow-hidden"
  style={{
    zIndex: 1,
    touchAction: 'none',   // 브라우저 터치 제스처 차단 (핀치줌, 패닝 등)
    userSelect: 'none',    // 텍스트 선택 방지
  }}
/>
```

### 3. `src/game/scenes/GameScene.ts`

`create()` 안에 포인터 이벤트 예시 추가:

```ts
private setupPointerEvents(): void {
  // 씬 레벨 우클릭 차단 (추가 보호)
  this.input.mouse?.disableContextMenu()

  // 마우스·터치 통합 포인터 이벤트 예시
  // p.x, p.y는 게임 논리 좌표 (플랫폼/DPR 변환 자동 처리)
  this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
    if (p.rightButtonDown()) return  // 우클릭 무시
    // onTap(p.x, p.y) 등 게임 로직 호출
  })

  this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
    if (!p.isDown) return  // 드래그 중일 때만
    // onDrag(p.x, p.y)
  })

  this.input.on('pointerup', (_p: Phaser.Input.Pointer) => {
    // onRelease()
  })
}
```

`create()` 안에서 호출:
```ts
this.buildPlayer()
this.setupInput()
this.setupResize()
this.setupPointerEvents()   // ← 추가
```

---

## 변경 없는 것

- Phaser가 canvas에 `touch-action: none`, `user-select: none`을 자동 적용 → canvas 자체는 OK
- 터치 좌표 변환 → Phaser 내장 처리, 별도 코드 불필요
- 모바일 판별 → `this.sys.game.device.os` 사용 가능 (씬 내부에서 필요 시)

---

## 검증

1. `npx tsc --noEmit` → 에러 0
2. PC: 방향키 → 페이지 스크롤 없음, 우클릭 → 컨텍스트 메뉴 없음, 휠 → 스크롤 없음
3. 모바일(DevTools 기기 시뮬레이션): 핀치줌 없음, 터치 드래그로 페이지 스크롤 없음
