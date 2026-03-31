import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { UiState, GameScreen } from '@/types/game.types'

export const useUiStore = create<UiState>()(
  subscribeWithSelector((set) => ({
    // 초기 상태
    currentScreen: 'menu' as GameScreen,
    isLoading: false,
    loadingProgress: 0,
    loadingMessage: '로딩 중...',

    // 현재 화면 전환
    setScreen: (screen: GameScreen) => set({ currentScreen: screen }),

    // 로딩 상태 설정
    setLoading: (loading: boolean) => set({ isLoading: loading }),

    // 로딩 진행률 업데이트 (0-100)
    setLoadingProgress: (progress: number) =>
      set({ loadingProgress: Math.min(100, Math.max(0, progress)) }),

    // 로딩 메시지 업데이트
    setLoadingMessage: (message: string) => set({ loadingMessage: message }),
  }))
)
