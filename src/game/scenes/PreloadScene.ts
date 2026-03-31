import { Graphics, Text, TextStyle } from 'pixi.js'
import { BaseScene } from './BaseScene'
import type { AssetManager } from '../managers/AssetManager'
import type { SceneManager } from './SceneManager'
import { useUiStore } from '@/stores/uiStore'
import type { AssetEntry } from '@/types/game.types'

// 사전 로딩할 에셋 목록 (실제 게임에 맞게 수정)
const PRELOAD_ASSETS: AssetEntry[] = [
  // 예시: { alias: 'player', src: '/assets/sprites/player.png' },
  // 예시: { alias: 'bgm', src: '/assets/audio/bgm.mp3' },
]

/**
 * 에셋 사전 로딩 씬
 * 로딩 완료 후 GameScene으로 자동 전환
 */
export class PreloadScene extends BaseScene {
  private assetManager: AssetManager
  private sceneManager: SceneManager
  private progressBar!: Graphics
  private progressText!: Text
  private loadingText!: Text

  constructor(assetManager: AssetManager, sceneManager: SceneManager) {
    super()
    this.assetManager = assetManager
    this.sceneManager = sceneManager
  }

  async onEnter(): Promise<void> {
    // uiStore 로딩 상태 시작
    useUiStore.getState().setLoading(true)
    useUiStore.getState().setLoadingProgress(0)
    useUiStore.getState().setLoadingMessage('에셋 로딩 중...')

    this.buildUI()
    await this.loadAssets()
  }

  /**
   * 로딩 UI 구성 (로딩바 + 텍스트)
   */
  private buildUI(): void {
    // PixiJS v8: Container에서 직접 renderer 참조 불가
    // 고정 해상도 사용 (resizeTo로 동적 조정됨)
    const width = 800
    const height = 600
    const cx = width / 2
    const cy = height / 2

    // 로딩 텍스트
    const titleStyle = new TextStyle({
      fill: '#ffffff',
      fontSize: 24,
      fontFamily: 'system-ui',
      fontWeight: 'bold',
    })
    this.loadingText = new Text({ text: 'LOADING...', style: titleStyle })
    this.loadingText.anchor.set(0.5)
    this.loadingText.position.set(cx, cy - 60)
    this.addChild(this.loadingText)

    // 로딩바 배경
    const barBg = new Graphics()
    barBg.rect(cx - 200, cy - 10, 400, 20).fill({ color: 0x333333 })
    this.addChild(barBg)

    // 로딩바 진행 표시
    this.progressBar = new Graphics()
    this.progressBar.position.set(cx - 200, cy - 10)
    this.addChild(this.progressBar)

    // 진행률 텍스트
    const progressStyle = new TextStyle({
      fill: '#aaaaaa',
      fontSize: 14,
      fontFamily: 'system-ui',
    })
    this.progressText = new Text({ text: '0%', style: progressStyle })
    this.progressText.anchor.set(0.5)
    this.progressText.position.set(cx, cy + 20)
    this.addChild(this.progressText)
  }

  /**
   * 에셋 로딩 실행
   */
  private async loadAssets(): Promise<void> {
    if (PRELOAD_ASSETS.length === 0) {
      // 에셋 없으면 바로 완료
      this.updateProgress(100)
      await this.delay(500)
      await this.transitionToGame()
      return
    }

    await this.assetManager.loadAssets(PRELOAD_ASSETS, (progress) => {
      this.updateProgress(progress)
    })

    await this.delay(300)
    await this.transitionToGame()
  }

  /**
   * 진행률 UI 업데이트
   */
  private updateProgress(progress: number): void {
    const barWidth = Math.floor(400 * (progress / 100))

    this.progressBar.clear()
    if (barWidth > 0) {
      this.progressBar.rect(0, 0, barWidth, 20).fill({ color: 0x6366f1 })
    }

    this.progressText.text = `${Math.floor(progress)}%`

    // uiStore에도 반영
    useUiStore.getState().setLoadingProgress(progress)
  }

  /**
   * GameScene으로 전환
   */
  private async transitionToGame(): Promise<void> {
    useUiStore.getState().setLoading(false)

    const { GameScene } = await import('./GameScene')
    await this.sceneManager.switchTo(new GameScene())
  }

  update(_deltaTime: number): void {
    // PreloadScene은 업데이트 불필요
  }

  /**
   * 지연 유틸리티
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
