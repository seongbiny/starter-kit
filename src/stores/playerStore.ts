import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlayerStoreState } from '@/types/game.types'

export const usePlayerStore = create<PlayerStoreState>()(
  persist(
    (set) => ({
      // 초기 상태 (로컬스토리지에 저장됨)
      nickname: '',
      bestScore: 0,

      // 닉네임 설정
      setNickname: (nickname: string) => set({ nickname: nickname.trim() }),

      // 최고 점수 갱신 (현재보다 높을 때만)
      updateBestScore: (score: number) =>
        set((state) => ({
          bestScore: Math.max(state.bestScore, score),
        })),
    }),
    {
      name: 'player-data', // 로컬스토리지 키
    }
  )
)
