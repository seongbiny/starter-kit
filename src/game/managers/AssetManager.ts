import { Assets } from 'pixi.js'
import type { AssetEntry } from '@/types/game.types'

/**
 * PixiJS Assets API 래퍼
 * 에셋 로딩, 캐싱, 해제를 담당
 */
export class AssetManager {
  // 로딩 진행률 콜백 (GameApp에서 설정)
  onProgress: ((progress: number) => void) | null = null

  /**
   * 에셋 배열 로딩 (진행률 콜백 포함)
   */
  async loadAssets(
    assets: AssetEntry[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (assets.length === 0) return

    // 에셋 번들 등록
    Assets.addBundle('game-assets', assets.map((a) => ({ alias: a.alias, src: a.src })))

    // 로딩 실행 (진행률 추적)
    await Assets.loadBundle('game-assets', (progress) => {
      const percent = Math.floor(progress * 100)
      onProgress?.(percent)
      this.onProgress?.(percent)
    })
  }

  /**
   * 단일 에셋 로딩
   */
  async load<T>(src: string): Promise<T> {
    return Assets.load<T>(src)
  }

  /**
   * 캐시된 에셋 반환
   */
  get<T>(alias: string): T {
    return Assets.get<T>(alias)
  }

  /**
   * 특정 에셋 언로드 (WebGL 메모리 해제)
   */
  async unload(alias: string): Promise<void> {
    await Assets.unload(alias)
  }

  /**
   * 번들 전체 언로드
   */
  async unloadBundle(bundleId: string): Promise<void> {
    await Assets.unloadBundle(bundleId)
  }
}
