import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { useLeaderboard } from '@/hooks/useLeaderboard'

/**
 * 리더보드 페이지
 * 상위 10개 점수 표시, 수동 갱신 지원
 */
export function LeaderboardPage() {
  const navigate = useNavigate()
  const { refetch, isLoading } = useLeaderboard()

  return (
    <div className="min-h-screen bg-game-dark px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate('/')}
            className="gap-1"
          >
            <ArrowLeft size={16} />
            돌아가기
          </Button>

          <h1 className="text-2xl font-bold text-white tracking-widest">LEADERBOARD</h1>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            갱신
          </Button>
        </motion.div>

        {/* 리더보드 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LeaderboardTable />
        </motion.div>

        {/* 게임 시작 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Button
            variant="game"
            size="lg"
            onClick={() => void navigate('/game')}
          >
            게임 시작
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
