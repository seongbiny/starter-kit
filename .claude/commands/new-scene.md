---
description: 새 PixiJS 씬을 스캐폴딩합니다 (BaseScene 상속, Zustand 브릿지 포함)
argument-hint: 씬 이름 (예: Boss, Tutorial, Cutscene)
---

`src/game/scenes/$ARGUMENTSScene.ts` 파일을 새로 생성해줘.

아래 규칙을 정확히 따를 것:

1. 클래스명: `$ARGUMENTSScene`
2. `BaseScene`을 상속 (`./BaseScene`에서 import)
3. 다음 구조를 포함:
   - `private unsubscribes: (() => void)[] = []` 필드
   - `async onEnter(): Promise<void>` — useUiStore.getState().setScreen('game') 호출 포함
   - `private setupStoreSubscriptions(): void` — useGameStore.subscribe() 예시 패턴 포함
   - `update(deltaTime: number): void` — isPaused/isGameOver 가드 포함
   - `onExit(): void` — unsubscribes 해제 후 super.onExit() 호출

4. SceneManager에서 이 씬으로 전환하는 방법을 파일 상단 주석에 포함:
   ```
   // 사용법: sceneManager.switchTo(new $ARGUMENTSScene())
   ```

5. Zustand import:
   - `useGameStore` from `@/stores/gameStore`
   - `useUiStore` from `@/stores/uiStore`

6. 파일 생성 후 다음을 알려줄 것:
   - 생성된 파일 경로
   - SceneManager에서 전환하는 코드 스니펫
