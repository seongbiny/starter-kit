import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { Button } from '@/components/ui/button'

/**
 * 일시정지 메뉴
 * ESC 키로 토글, 게임 위에 오버레이로 표시
 */
export function PauseMenu() {
  const navigate = useNavigate()
  const isPaused = useGameStore((state) => state.isPaused)
  const setPaused = useGameStore((state) => state.setPaused)
  const resetGame = useGameStore((state) => state.resetGame)

  const handleResume = () => setPaused(false)

  const handleRestart = () => {
    resetGame()
    setPaused(false)
    navigate('/game')
  }

  const handleMenu = () => {
    resetGame()
    navigate('/')
  }

  return (
    <AnimatePresence>
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center bg-black/70"
          style={{ zIndex: 20 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-6 bg-game-dark-2 border border-game-border rounded-xl p-10"
          >
            <h2 className="text-3xl font-bold text-white tracking-widest">PAUSED</h2>

            <div className="flex flex-col gap-3 w-48">
              <Button
                variant="game"
                size="lg"
                className="pointer-events-auto"
                onClick={handleResume}
              >
                계속하기
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="pointer-events-auto"
                onClick={handleRestart}
              >
                다시 시작
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="pointer-events-auto"
                onClick={handleMenu}
              >
                메인 메뉴
              </Button>
            </div>

            <p className="text-white/30 text-xs">ESC 키로 재개</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
