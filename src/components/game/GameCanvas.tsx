import { useGameCanvas } from '@/hooks/useGameCanvas'

/**
 * PixiJS 캔버스 마운트 컴포넌트
 * 이 컴포넌트가 렌더링되면 PixiJS 앱이 초기화됨
 */
export function GameCanvas() {
  const containerRef = useGameCanvas()

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ zIndex: 1 }}
    />
  )
}
