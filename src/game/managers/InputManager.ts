import type { InputState } from '@/types/game.types'

/**
 * 키보드/터치/마우스 입력 통합 관리자
 * PixiJS 캔버스 레벨에서 독립적으로 동작
 */
export class InputManager {
  private state: InputState = {
    keys: new Set<string>(),
    isPointerDown: false,
    pointerPosition: { x: 0, y: 0 },
  }

  private canvas: HTMLCanvasElement | null = null
  private listeners: Array<{ target: EventTarget; type: string; handler: EventListener }> = []

  /**
   * 입력 리스너 초기화 (캔버스에 바인딩)
   */
  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    this.registerListeners()
  }

  private registerListeners(): void {
    // 키보드 이벤트
    this.addListener(window, 'keydown', (e: Event) => {
      this.state.keys.add((e as KeyboardEvent).code)
    })
    this.addListener(window, 'keyup', (e: Event) => {
      this.state.keys.delete((e as KeyboardEvent).code)
    })

    if (!this.canvas) return

    // 마우스 이벤트
    this.addListener(this.canvas, 'mousedown', (e: Event) => {
      const me = e as MouseEvent
      this.state.isPointerDown = true
      this.state.pointerPosition = { x: me.offsetX, y: me.offsetY }
    })
    this.addListener(this.canvas, 'mouseup', () => {
      this.state.isPointerDown = false
    })
    this.addListener(this.canvas, 'mousemove', (e: Event) => {
      const me = e as MouseEvent
      this.state.pointerPosition = { x: me.offsetX, y: me.offsetY }
    })

    // 터치 이벤트
    this.addListener(this.canvas, 'touchstart', (e: Event) => {
      const te = e as TouchEvent
      e.preventDefault()
      this.state.isPointerDown = true
      if (te.touches.length > 0) {
        const rect = this.canvas!.getBoundingClientRect()
        this.state.pointerPosition = {
          x: te.touches[0].clientX - rect.left,
          y: te.touches[0].clientY - rect.top,
        }
      }
    }, { passive: false } as AddEventListenerOptions)
    this.addListener(this.canvas, 'touchend', () => {
      this.state.isPointerDown = false
    })
    this.addListener(this.canvas, 'touchmove', (e: Event) => {
      const te = e as TouchEvent
      e.preventDefault()
      if (te.touches.length > 0 && this.canvas) {
        const rect = this.canvas.getBoundingClientRect()
        this.state.pointerPosition = {
          x: te.touches[0].clientX - rect.left,
          y: te.touches[0].clientY - rect.top,
        }
      }
    }, { passive: false } as AddEventListenerOptions)
  }

  private addListener(
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(type, handler, options)
    this.listeners.push({ target, type, handler })
  }

  /**
   * 특정 키 눌림 여부 확인
   */
  isKeyDown(code: string): boolean {
    return this.state.keys.has(code)
  }

  /**
   * 포인터 눌림 여부 확인
   */
  isPointerDown(): boolean {
    return this.state.isPointerDown
  }

  /**
   * 현재 포인터 위치
   */
  getPointerPosition(): { x: number; y: number } {
    return { ...this.state.pointerPosition }
  }

  /**
   * 리스너 제거 및 상태 초기화
   */
  destroy(): void {
    this.listeners.forEach(({ target, type, handler }) => {
      target.removeEventListener(type, handler)
    })
    this.listeners = []
    this.state.keys.clear()
    this.state.isPointerDown = false
    this.canvas = null
  }
}
