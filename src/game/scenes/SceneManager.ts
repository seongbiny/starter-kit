import { Application, Ticker } from 'pixi.js'
import type { BaseScene } from './BaseScene'
import { AssetManager } from '../managers/AssetManager'

/**
 * 씬 전환 및 게임 루프를 관리하는 매니저
 */
export class SceneManager {
  private app: Application
  private assetManager: AssetManager
  private currentScene: BaseScene | null = null
  private tickerCallback: ((ticker: Ticker) => void) | null = null

  constructor(app: Application, assetManager: AssetManager) {
    this.app = app
    this.assetManager = assetManager
  }

  /**
   * PreloadScene부터 게임 시작
   */
  async start(): Promise<void> {
    const { PreloadScene } = await import('./PreloadScene')
    await this.switchTo(new PreloadScene(this.assetManager, this))
  }

  /**
   * 씬 전환 (현재 씬 정리 후 새 씬 시작)
   */
  async switchTo(scene: BaseScene): Promise<void> {
    // 기존 씬 정리
    if (this.currentScene) {
      this.currentScene.onExit()
      this.app.stage.removeChild(this.currentScene)
    }

    // 게임 루프 제거
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback)
    }

    // 새 씬 설정
    this.currentScene = scene
    this.app.stage.addChild(scene)

    // 새 씬 진입
    await scene.onEnter()

    // 게임 루프 등록
    this.tickerCallback = (ticker: Ticker) => {
      scene.update(ticker.deltaTime)
    }
    this.app.ticker.add(this.tickerCallback)
  }

  /**
   * 현재 씬 반환
   */
  getCurrentScene(): BaseScene | null {
    return this.currentScene
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback)
    }
    if (this.currentScene) {
      this.currentScene.onExit()
    }
  }
}
