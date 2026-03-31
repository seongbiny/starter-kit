import { GameLayout } from '@/components/layout/GameLayout'
import { GameHUD } from '@/components/game/GameHUD'
import { PauseMenu } from '@/components/game/PauseMenu'
import { GameOverModal } from '@/components/game/GameOverModal'

/**
 * 게임 페이지
 * GameLayout 안에 PixiJS 캔버스 + React 오버레이 조합
 */
export function GamePage() {
  return (
    <GameLayout>
      {/* HUD: 점수, 생명, 레벨 */}
      <GameHUD />

      {/* 일시정지 메뉴 (ESC 키) */}
      <PauseMenu />

      {/* 게임오버 모달 */}
      <GameOverModal />
    </GameLayout>
  )
}
