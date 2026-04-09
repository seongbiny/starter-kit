import Phaser from 'phaser'
import { useGameStore } from '@/stores/gameStore'
import { PreloadScene } from './scenes/PreloadScene'
import { GameScene } from './scenes/GameScene'
import { AudioManager } from './managers/AudioManager'

/**
 * Phaser 게임 싱글턴
 * React StrictMode 이중 실행 방어 및 Zustand ↔ Phaser 브릿지
 */
export class GameApp {
  private static instance: GameApp | null = null

  private game: Phaser.Game | null = null
  readonly audioManager: AudioManager

  private constructor() {
    this.audioManager = new AudioManager()
  }

  static getInstance(): GameApp {
    if (!GameApp.instance) {
      GameApp.instance = new GameApp()
    }
    return GameApp.instance
  }

  /**
   * Phaser 게임을 DOM 요소에 마운트
   */
  mount(container: HTMLElement): void {
    // StrictMode 이중 실행 방어: 이미 게임 인스턴스가 있으면 캔버스만 재삽입
    if (this.game) {
      container.appendChild(this.game.canvas)
      return
    }

    this.game = new Phaser.Game({
      type: Phaser.AUTO,        // WebGL 우선, Canvas 폴백
      parent: container,        // React ref div에 캔버스 삽입
      width: 800,
      height: 600,
      backgroundColor: '#0f0f1a',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false },
      },
      scene: [PreloadScene, GameScene],
      banner: false,
    })

    this.setupStoreBridges()
  }

  /**
   * 캔버스를 DOM에서 제거 (React 언마운트 시 호출)
   */
  unmount(): void {
    this.game?.canvas.remove()
  }

  /**
   * 완전한 리소스 정리 (앱 종료 시)
   */
  destroy(): void {
    this.audioManager.destroy()
    this.game?.destroy(true)
    this.game = null
    GameApp.instance = null
  }

  /**
   * Zustand 스토어 변경 → Phaser 씬 제어 브릿지
   */
  private setupStoreBridges(): void {
    // isPaused 변경 시 GameScene 일시정지/재개
    useGameStore.subscribe(
      (state) => state.isPaused,
      (isPaused) => {
        if (isPaused) {
          this.game?.scene.pause('GameScene')
        } else {
          this.game?.scene.resume('GameScene')
        }
      }
    )

    // 게임오버 시 GameScene 정지
    useGameStore.subscribe(
      (state) => state.isGameOver,
      (isGameOver) => {
        if (isGameOver) {
          this.game?.scene.pause('GameScene')
        }
      }
    )
  }
}
