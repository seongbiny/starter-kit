import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Play, Trophy, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlayerStore } from '@/stores/playerStore'

/**
 * 메인 메뉴 페이지
 * 게임 시작, 리더보드, 설정으로 이동
 */
export function MenuPage() {
  const navigate = useNavigate()
  const bestScore = usePlayerStore((state) => state.bestScore)

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-game-dark gap-8 px-4">
      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-2"
      >
        <h1 className="text-6xl font-black text-white tracking-widest uppercase">
          MINI<span className="text-game-primary">GAME</span>
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase">
          HTML5 Game Starter Kit
        </p>
        {bestScore > 0 && (
          <div className="flex items-center gap-1 text-game-accent text-sm">
            <Trophy size={14} />
            <span>최고 점수: {bestScore.toLocaleString()}</span>
          </div>
        )}
      </motion.div>

      {/* 메뉴 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-3 w-56"
      >
        <Button
          variant="game"
          size="xl"
          className="w-full gap-2"
          onClick={() => void navigate('/game')}
        >
          <Play size={20} />
          게임 시작
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full gap-2"
          onClick={() => void navigate('/leaderboard')}
        >
          <Trophy size={18} />
          리더보드
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full gap-2"
          onClick={() => void navigate('/settings')}
        >
          <Settings size={18} />
          설정
        </Button>
      </motion.div>

      {/* 하단 크레딧 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 text-white/20 text-xs"
      >
        Built with PixiJS + React + Supabase
      </motion.p>
    </div>
  )
}
