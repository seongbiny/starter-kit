import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { GameState, GameStatus } from '@/types/game.types'

const INITIAL_LIVES = 3

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set) => ({
    // 초기 상태
    score: 0,
    level: 1,
    lives: INITIAL_LIVES,
    isPaused: false,
    isGameOver: false,
    status: 'idle' as GameStatus,

    // 점수 추가
    addScore: (points: number) =>
      set((state) => ({ score: state.score + points })),

    // 레벨 설정
    setLevel: (level: number) => set({ level }),

    // 생명 감소 (0이 되면 게임오버)
    loseLife: () =>
      set((state) => {
        const newLives = state.lives - 1
        if (newLives <= 0) {
          return { lives: 0, isGameOver: true, status: 'gameover' as GameStatus }
        }
        return { lives: newLives }
      }),

    // 일시정지 설정
    setPaused: (paused: boolean) =>
      set({ isPaused: paused, status: paused ? 'paused' : 'playing' }),

    // 게임오버 설정
    setGameOver: () =>
      set({ isGameOver: true, status: 'gameover' }),

    // 게임 리셋
    resetGame: () =>
      set({
        score: 0,
        level: 1,
        lives: INITIAL_LIVES,
        isPaused: false,
        isGameOver: false,
        status: 'idle',
      }),

    // 상태 직접 설정
    setStatus: (status: GameStatus) => set({ status }),
  }))
)
