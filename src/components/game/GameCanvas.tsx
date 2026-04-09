import { useGameCanvas } from '@/hooks/useGameCanvas'

/**
 * Phaser 캔버스 마운트 컴포넌트
 * 이 컴포넌트가 렌더링되면 Phaser 게임이 초기화됨
 */
export function GameCanvas() {
  const containerRef = useGameCanvas()

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        zIndex: 1,
        touchAction: 'none',  // 핀치줌, 패닝 등 브라우저 터치 제스처 차단
        userSelect: 'none',   // 텍스트 선택 방지
      }}
    />
  )
}
