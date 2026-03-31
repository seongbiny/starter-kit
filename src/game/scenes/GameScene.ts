import { Graphics, Text, TextStyle } from 'pixi.js'
import { BaseScene } from './BaseScene'
import { useGameStore } from '@/stores/gameStore'
import { useUiStore } from '@/stores/uiStore'
import { Player } from '../entities/Player'
import { InputManager } from '../managers/InputManager'

/**
 * 게임플레이 메인 씬 예시
 * 실제 게임 로직으로 교체 가능한 템플릿
 */
export class GameScene extends BaseScene {
  private player!: Player
  private inputManager: InputManager
  private scoreText!: Text
  private background!: Graphics
  private unsubscribes: (() => void)[] = []

  // 간단한 점수 증가 타이머 예시
  private scoreTimer = 0
  private readonly SCORE_INTERVAL = 60 // 60프레임마다 점수 증가

  constructor() {
    super()
    this.inputManager = new InputManager()
  }

  async onEnter(): Promise<void> {
    useGameStore.getState().resetGame()
    useGameStore.getState().setStatus('playing')
    useUiStore.getState().setScreen('game')

    this.buildBackground()
    this.buildPlayer()
    this.buildHUDOverlay()
    this.setupInputs()
    this.setupStoreSubscriptions()
  }

  /**
   * 배경 생성
   */
  private buildBackground(): void {
    this.background = new Graphics()
    this.background.rect(0, 0, 800, 600).fill({ color: 0x0f0f1a })
    this.addChildAt(this.background, 0)
  }

  /**
   * 플레이어 생성
   */
  private buildPlayer(): void {
    this.player = new Player()
    this.player.position.set(400, 300)
    this.addChild(this.player)
  }

  /**
   * PixiJS 레이어의 간단한 점수 오버레이 (React HUD와 별개)
   */
  private buildHUDOverlay(): void {
    const style = new TextStyle({
      fill: 'rgba(255,255,255,0.3)',
      fontSize: 12,
      fontFamily: 'system-ui',
    })
    this.scoreText = new Text({ text: 'GAME SCENE', style })
    this.scoreText.position.set(10, 10)
    this.addChild(this.scoreText)
  }

  /**
   * 키보드 입력 설정
   */
  private setupInputs(): void {
    // ESC 키: 일시정지
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const { isPaused, setPaused } = useGameStore.getState()
        setPaused(!isPaused)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    this.unsubscribes.push(() => window.removeEventListener('keydown', onKeyDown))
  }

  /**
   * Zustand 스토어 구독 (PixiJS ↔ React 브릿지)
   */
  private setupStoreSubscriptions(): void {
    // isPaused 변경 감지 (ticker는 GameApp에서 제어)
    const unsubPause = useGameStore.subscribe(
      (state) => state.isPaused,
      (isPaused) => {
        this.player.setVisible(!isPaused)
      }
    )
    this.unsubscribes.push(unsubPause)
  }

  /**
   * 매 프레임 업데이트
   */
  update(deltaTime: number): void {
    const { isPaused, isGameOver } = useGameStore.getState()
    if (isPaused || isGameOver) return

    // 플레이어 업데이트
    this.player.update(deltaTime, this.inputManager)

    // 점수 자동 증가 예시 (실제 게임 로직으로 교체)
    this.scoreTimer++
    if (this.scoreTimer >= this.SCORE_INTERVAL) {
      this.scoreTimer = 0
      useGameStore.getState().addScore(10)
    }
  }

  onExit(): void {
    // 구독 해제
    this.unsubscribes.forEach((unsub) => unsub())
    this.unsubscribes = []

    this.inputManager.destroy()

    // 부모 클래스의 정리 (텍스처 destroy 포함)
    super.onExit()
  }
}
