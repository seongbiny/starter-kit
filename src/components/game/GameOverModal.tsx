import { useNavigate } from 'react-router'
import { useGameStore } from '@/stores/gameStore'
import { usePlayerStore } from '@/stores/playerStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScoreSubmitForm } from '@/components/leaderboard/ScoreSubmitForm'

/**
 * 게임오버 모달
 * 최종 점수 표시 + 리더보드 점수 제출
 */
export function GameOverModal() {
  const navigate = useNavigate()
  const isGameOver = useGameStore((state) => state.isGameOver)
  const score = useGameStore((state) => state.score)
  const level = useGameStore((state) => state.level)
  const resetGame = useGameStore((state) => state.resetGame)
  const updateBestScore = usePlayerStore((state) => state.updateBestScore)
  const bestScore = usePlayerStore((state) => state.bestScore)

  // 게임오버 시 최고 점수 갱신
  if (isGameOver && score > 0) {
    updateBestScore(score)
  }

  const handleRestart = () => {
    resetGame()
    navigate('/game')
  }

  const handleGoMenu = () => {
    resetGame()
    navigate('/')
  }

  return (
    <Dialog open={isGameOver}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-game-danger">
            GAME OVER
          </DialogTitle>
          <DialogDescription className="text-center">
            게임이 종료되었습니다
          </DialogDescription>
        </DialogHeader>

        {/* 점수 표시 */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="text-white/60 text-sm">최종 점수</div>
          <div className="text-4xl font-bold text-white tabular-nums">
            {score.toLocaleString()}
          </div>
          {score >= bestScore && score > 0 && (
            <div className="text-game-accent text-sm font-bold animate-pulse">
              🏆 신기록!
            </div>
          )}
          <div className="text-white/40 text-sm">레벨 {level} 도달</div>
        </div>

        {/* 점수 제출 폼 */}
        <ScoreSubmitForm score={score} level={level} />

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="game"
            className="flex-1 pointer-events-auto"
            onClick={handleRestart}
          >
            다시 시작
          </Button>
          <Button
            variant="outline"
            className="flex-1 pointer-events-auto"
            onClick={handleGoMenu}
          >
            메인 메뉴
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
