import { useEffect, useRef } from 'react'
import { GameApp } from '@game/GameApp'

/**
 * PixiJS 캔버스 마운트 브릿지 훅 (핵심)
 * React DOM과 PixiJS 캔버스의 생명주기를 연결
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
    let mounted = false

    // 비동기 마운트
    void gameApp.mount(container).then(() => {
      mounted = true
    })

    // 클린업: React StrictMode의 이중 실행에 안전
    return () => {
      if (mounted) {
        gameApp.unmount()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return containerRef
}
