import { useEffect, useRef } from 'react'
import { GameApp } from '@game/GameApp'

/**
 * Phaser 캔버스 마운트 브릿지 훅
 * React DOM과 Phaser 캔버스의 생명주기를 연결
 *
 * 사용법:
 * const containerRef = useGameCanvas()
 * <div ref={containerRef} />
 */
export function useGameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const gameApp = GameApp.getInstance()
    // Phaser.Game 생성자는 동기 — async/await 불필요
    gameApp.mount(container)

    // 클린업: React StrictMode 이중 실행에 안전
    return () => {
      gameApp.unmount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return containerRef
}
