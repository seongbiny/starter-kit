import type { ReactNode } from 'react'
import { GameCanvas } from '@/components/game/GameCanvas'

interface GameLayoutProps {
  children: ReactNode
}

/**
 * Canvas + React DOM 오버레이 레이아웃 래퍼
 *
 * 레이어 구조:
 * - z-index 1: PixiJS 캔버스 (게임 렌더링)
 * - z-index 10: React 오버레이 (HUD, 메뉴, 모달)
 *
 * 오버레이 div는 pointer-events-none이며,
 * 클릭이 필요한 요소에만 pointer-events-auto 적용
 */
export function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-game-dark">
      {/* PixiJS 캔버스 레이어 */}
      <GameCanvas />

      {/* React DOM 오버레이 레이어 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {children}
      </div>
    </div>
  )
}
