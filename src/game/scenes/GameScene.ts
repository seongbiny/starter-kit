import Phaser from 'phaser'
import { useGameStore } from '@/stores/gameStore'
import { useUiStore } from '@/stores/uiStore'

/**
 * 게임플레이 메인 씬
 * create()에서 게임 오브젝트 초기화, update()에서 매 프레임 로직 실행
 */
export class GameScene extends Phaser.Scene {
  // 플레이어 (스프라이트로 교체 전 사각형 플레이스홀더)
  private player!: Phaser.GameObjects.Rectangle

  // 키보드 입력
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>

  // 점수 증가 타이머 예시
  private scoreTimer = 0
  private readonly SCORE_INTERVAL = 60

  constructor() {
    super({ key: 'GameScene' })
  }

  create(): void {
    useGameStore.getState().resetGame()
    useGameStore.getState().setStatus('playing')
    useUiStore.getState().setScreen('game')

    this.buildPlayer()
    this.setupInput()
  }

  /**
   * 플레이어 생성 (사각형 플레이스홀더)
   * 실제 스프라이트: this.physics.add.sprite(400, 300, 'player')
   */
  private buildPlayer(): void {
    this.player = this.add.rectangle(400, 300, 40, 40, 0x6366f1)
    this.physics.add.existing(this.player)

    // 화면 경계에서 멈춤
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
  }

  /**
   * 키보드 입력 초기화
   * - 방향키 + WASD 이동
   * - ESC 일시정지 (Phaser → Zustand → GameApp 브릿지)
   */
  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }

    // ESC: 단방향 흐름 — Phaser 감지 → Zustand 변경 → GameApp.setupStoreBridges → scene.pause()
    this.input.keyboard!.on('keydown-ESC', () => {
      const { isPaused, setPaused } = useGameStore.getState()
      setPaused(!isPaused)
    })
  }

  /**
   * 매 프레임 업데이트
   */
  update(_time: number, _delta: number): void {
    const { isPaused, isGameOver } = useGameStore.getState()
    if (isPaused || isGameOver) return

    this.handleMovement()
    this.handleScoreTimer()
  }

  /**
   * 플레이어 이동 처리
   */
  private handleMovement(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    const speed = 200

    body.setVelocity(0)

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  body.setVelocityX(-speed)
    if (this.cursors.right.isDown || this.wasd.right.isDown) body.setVelocityX(speed)
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    body.setVelocityY(-speed)
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  body.setVelocityY(speed)
  }

  /**
   * 60프레임마다 점수 증가 (게임 로직 예시)
   */
  private handleScoreTimer(): void {
    this.scoreTimer++
    if (this.scoreTimer >= this.SCORE_INTERVAL) {
      this.scoreTimer = 0
      useGameStore.getState().addScore(10)
    }
  }

  /**
   * Phaser 내장 생명주기 훅 — scene.start() 호출 시 자동 실행
   */
  shutdown(): void {
    this.scoreTimer = 0
  }
}
