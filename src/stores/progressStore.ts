import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProgressState } from '@/types/game.types'

/**
 * 게임 진행도 + 통계 스토어 (localStorage 영속)
 *
 * 사용 예시:
 *   게임오버 시: useProgressStore.getState().recordSession(elapsedSeconds)
 *   레벨 클리어 시: useProgressStore.getState().updateHighestLevel(level)
 *                   useProgressStore.getState().unlockStage(level + 1)
 */
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      // 진행도 초기값
      highestLevel: 1,
      unlockedStages: [1],
      difficulty: 'normal',

      // 통계 초기값
      totalPlayCount: 0,
      totalPlayTimeSeconds: 0,

      // 난이도 변경
      setDifficulty: (difficulty) => set({ difficulty }),

      // 스테이지 잠금 해제 (중복 방지, 오름차순 정렬 유지)
      unlockStage: (stage) =>
        set((s) => ({
          unlockedStages: s.unlockedStages.includes(stage)
            ? s.unlockedStages
            : [...s.unlockedStages, stage].sort((a, b) => a - b),
        })),

      // 최고 도달 레벨 갱신 (현재보다 높을 때만)
      updateHighestLevel: (level) =>
        set((s) => ({ highestLevel: Math.max(s.highestLevel, level) })),

      // 게임 1판 종료 시 통계 기록
      recordSession: (durationSeconds) =>
        set((s) => ({
          totalPlayCount: s.totalPlayCount + 1,
          totalPlayTimeSeconds: s.totalPlayTimeSeconds + durationSeconds,
        })),

      // 진행도 초기화 (난이도 설정은 유지)
      resetProgress: () =>
        set({
          highestLevel: 1,
          unlockedStages: [1],
          totalPlayCount: 0,
          totalPlayTimeSeconds: 0,
        }),
    }),
    {
      name: 'game-progress', // localStorage 키
    }
  )
)
