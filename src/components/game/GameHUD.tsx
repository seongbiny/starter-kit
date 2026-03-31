import { useGameStore } from '@/stores/gameStore'

/**
 * 게임 HUD (점수, 생명, 레벨 표시)
 * React DOM 오버레이 레이어에서 렌더링
 */
export function GameHUD() {
  const score = useGameStore((state) => state.score)
  const lives = useGameStore((state) => state.lives)
  const level = useGameStore((state) => state.level)

  return (
    <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 pointer-events-none">
      {/* 점수 */}
      <div className="flex flex-col">
        <span className="text-white/50 text-xs uppercase tracking-widest">점수</span>
        <span className="text-white text-2xl font-bold tabular-nums">
          {score.toLocaleString()}
        </span>
      </div>

      {/* 레벨 */}
      <div className="flex flex-col items-center">
        <span className="text-white/50 text-xs uppercase tracking-widest">레벨</span>
        <span className="text-game-accent text-2xl font-bold">{level}</span>
      </div>

      {/* 생명 */}
      <div className="flex flex-col items-end">
        <span className="text-white/50 text-xs uppercase tracking-widest">생명</span>
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-xl ${i < lives ? 'text-game-danger' : 'text-white/20'}`}
            >
              ♥
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
