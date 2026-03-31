import { Trophy, Loader2, AlertCircle } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'

/**
 * 리더보드 테이블 컴포넌트
 * TanStack Query로 데이터 fetch, 자동 갱신
 */
export function LeaderboardTable() {
  const { entries, isLoading, isError, error } = useLeaderboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-game-primary" size={32} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-game-danger">
        <AlertCircle size={32} />
        <p className="text-sm">{error?.message ?? '데이터를 불러오는 중 오류가 발생했습니다'}</p>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-white/40">
        아직 기록이 없습니다. 첫 번째 도전자가 되세요!
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-game-border">
      <table className="w-full">
        <thead>
          <tr className="bg-game-surface border-b border-game-border">
            <th className="py-3 px-4 text-left text-xs text-white/50 uppercase tracking-widest w-12">
              순위
            </th>
            <th className="py-3 px-4 text-left text-xs text-white/50 uppercase tracking-widest">
              닉네임
            </th>
            <th className="py-3 px-4 text-right text-xs text-white/50 uppercase tracking-widest">
              점수
            </th>
            <th className="py-3 px-4 text-right text-xs text-white/50 uppercase tracking-widest">
              레벨
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              className={`border-b border-game-border last:border-0 transition-colors hover:bg-game-surface ${
                index === 0 ? 'bg-game-accent/5' : ''
              }`}
            >
              <td className="py-3 px-4">
                {index === 0 ? (
                  <Trophy className="text-game-accent" size={16} />
                ) : index === 1 ? (
                  <span className="text-white/50 font-bold">{index + 1}</span>
                ) : index === 2 ? (
                  <span className="text-game-accent/60 font-bold">{index + 1}</span>
                ) : (
                  <span className="text-white/30 text-sm">{index + 1}</span>
                )}
              </td>
              <td className="py-3 px-4">
                <span className={`font-medium ${index === 0 ? 'text-game-accent' : 'text-white'}`}>
                  {entry.nickname}
                </span>
              </td>
              <td className="py-3 px-4 text-right tabular-nums">
                <span className="text-white font-bold">
                  {entry.score.toLocaleString()}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-white/60 text-sm">{entry.level}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
