import { Container } from 'pixi.js'
import type { IScene } from '@/types/game.types'

/**
 * 모든 씬의 기반 추상 클래스
 * 각 씬은 이 클래스를 상속받아 구현
 */
export abstract class BaseScene extends Container implements IScene {
  protected isDestroyed = false

  constructor() {
    super()
  }

  /**
   * 씬 진입 시 호출 (에셋 로딩, 초기화)
   */
  abstract onEnter(): Promise<void>

  /**
   * 씬 이탈 시 호출 (리소스 정리 필수)
   */
  onExit(): void {
    // 하위 클래스에서 override하여 텍스처 destroy() 호출
    this.cleanup()
  }

  /**
   * 매 프레임 호출 (게임 루프)
   */
  abstract update(deltaTime: number): void

  /**
   * 공통 리소스 정리 로직
   * WebGL 메모리 누수 방지를 위해 반드시 호출
   */
  protected cleanup(): void {
    if (!this.isDestroyed) {
      this.removeAllListeners()
      this.destroy({ children: true })
      this.isDestroyed = true
    }
  }
}
