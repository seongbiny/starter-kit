import { Graphics } from 'pixi.js'
import { Entity } from './Entity'
import type { InputManager } from '../managers/InputManager'

const MOVE_SPEED = 4
const SCREEN_WIDTH = 800
const SCREEN_HEIGHT = 600

/**
 * 플레이어 엔티티 예시
 * 키보드/터치 입력으로 이동 가능한 사각형 스프라이트
 * 실제 게임에 맞게 스프라이트 교체 필요
 */
export class Player extends Entity {
  private body!: Graphics

  constructor() {
    super()
    this.buildGraphics()
  }

  /**
   * 임시 그래픽 (실제 스프라이트로 교체 권장)
   */
  private buildGraphics(): void {
    this.body = new Graphics()
    this.body
      .rect(-20, -20, 40, 40)
      .fill({ color: 0x6366f1 })
      .stroke({ color: 0xffffff, width: 2 })
    this.addChild(this.body)
  }

  /**
   * 매 프레임 업데이트: 키보드 입력으로 이동
   */
  update(deltaTime: number, input: InputManager): void {
    if (!this.isActive) return

    const speed = MOVE_SPEED * deltaTime

    if (input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA')) {
      this.x -= speed
    }
    if (input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD')) {
      this.x += speed
    }
    if (input.isKeyDown('ArrowUp') || input.isKeyDown('KeyW')) {
      this.y -= speed
    }
    if (input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS')) {
      this.y += speed
    }

    // 화면 경계 안으로 제한
    this.clampToScreen(SCREEN_WIDTH, SCREEN_HEIGHT)
  }
}
