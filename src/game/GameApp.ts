import { Application } from 'pixi.js'
import type { GameConfig } from '@/types/game.types'
import { useGameStore } from '@/stores/gameStore'
import { useUiStore } from '@/stores/uiStore'
import { SceneManager } from './scenes/SceneManager'
import { AssetManager } from './managers/AssetManager'
import { AudioManager } from './managers/AudioManager'
import { InputManager } from './managers/InputManager'

// 기본 게임 설정
const DEFAULT_CONFIG: GameConfig = {
  width: 800,
  height: 600,
  backgroundColor: 0x0f0f1a,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
}

/**
 * PixiJS 애플리케이션 싱글턴
 * React StrictMode 이중 실행 방어를 위해 인스턴스 캐싱
 */
export class GameApp {
  private static instance: GameApp | null = null

  readonly app: Application
  readonly sceneManager: SceneManager
  readonly assetManager: AssetManager
  readonly audioManager: AudioManager
  readonly inputManager: InputManager

  private isInitialized = false

  private constructor() {
    this.app = new Application()
    this.assetManager = new AssetManager()
    this.audioManager = new AudioManager()
    this.inputManager = new InputManager()
    this.sceneManager = new SceneManager(this.app, this.assetManager)
  }

  /**
   * 싱글턴 인스턴스 반환 (없으면 생성)
   */
  static getInstance(): GameApp {
    if (!GameApp.instance) {
      GameApp.instance = new GameApp()
    }
    return GameApp.instance
  }

  /**
   * PixiJS 앱을 DOM 요소에 마운트하고 초기화
   */
  async mount(container: HTMLElement, config: Partial<GameConfig> = {}): Promise<void> {
    // StrictMode 이중 실행 방어
    if (this.isInitialized) {
      container.appendChild(this.app.canvas)
      return
    }

    const finalConfig = { ...DEFAULT_CONFIG, ...config }

    await this.app.init({
      width: finalConfig.width,
      height: finalConfig.height,
      background: finalConfig.backgroundColor,
      antialias: finalConfig.antialias,
      resolution: finalConfig.resolution,
      autoDensity: true,
      resizeTo: container,
    })

    container.appendChild(this.app.canvas)

    // 입력 매니저에 캔버스 등록
    this.inputManager.init(this.app.canvas)

    // Zustand ↔ PixiJS 브릿지 구독 설정
    this.setupStoreBridges()

    this.isInitialized = true

    // PreloadScene부터 시작
    await this.sceneManager.start()
  }

  /**
   * Zustand 스토어와 PixiJS 간 브릿지 구독 설정
   */
  private setupStoreBridges(): void {
    // isPaused 상태 변경 시 ticker 제어
    useGameStore.subscribe(
      (state) => state.isPaused,
      (isPaused) => {
        if (isPaused) {
          this.app.ticker.stop()
        } else {
          this.app.ticker.start()
        }
      }
    )

    // 게임오버 시 ticker 정지
    useGameStore.subscribe(
      (state) => state.isGameOver,
      (isGameOver) => {
        if (isGameOver) {
          this.app.ticker.stop()
        }
      }
    )

    // 로딩 진행률 업데이트 (AssetManager → uiStore)
    this.assetManager.onProgress = (progress) => {
      useUiStore.getState().setLoadingProgress(progress)
    }
  }

  /**
   * 캔버스를 DOM에서 제거하고 리소스 정리
   */
  unmount(): void {
    this.inputManager.destroy()
    if (this.app.canvas.parentElement) {
      this.app.canvas.parentElement.removeChild(this.app.canvas)
    }
  }

  /**
   * 완전한 리소스 정리 (앱 종료 시)
   */
  destroy(): void {
    this.unmount()
    this.sceneManager.destroy()
    this.audioManager.destroy()
    this.inputManager.destroy()
    this.app.destroy(true)
    GameApp.instance = null
    this.isInitialized = false
  }
}
