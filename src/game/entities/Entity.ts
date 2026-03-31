import { Container } from 'pixi.js'
import type { InputManager } from '../managers/InputManager'

/**
 * 게임 엔티티 기반 클래스
 * 모든 게임 오브젝트(플레이어, 적, 아이템 등)는 이 클래스를 상속
 */
export abstract class Entity extends Container {
  protected isActive = true

  constructor() {
    super()
  }

  /**
   * 매 프레임 업데이트 (게임 루프에서 호출)
   */
  abstract update(deltaTime: number, input: InputManager): void

  /**
   * 엔티티 활성화 상태 설정
   */
  setActive(active: boolean): void {
    this.isActive = active
    this.visible = active
  }

  /**
   * 가시성만 변경 (활성 상태는 유지)
   */
  setVisible(visible: boolean): void {
    this.visible = visible
  }

  /**
   * 화면 경계 내로 위치 클램핑
   */
  protected clampToScreen(width: number, height: number): void {
    const hw = this.width / 2
    const hh = this.height / 2
    this.x = Math.max(hw, Math.min(width - hw, this.x))
    this.y = Math.max(hh, Math.min(height - hh, this.y))
  }

  /**
   * 리소스 정리
   */
  destroy(options?: Parameters<Container['destroy']>[0]): void {
    this.removeAllListeners()
    super.destroy(options)
  }
}
