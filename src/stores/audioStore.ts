import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AudioState } from '@/types/game.types'

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      // 초기 상태 (로컬스토리지에 저장됨)
      bgmVolume: 0.5,
      sfxVolume: 0.7,
      isMuted: false,

      // BGM 볼륨 설정 (0.0 ~ 1.0)
      setBgmVolume: (volume: number) =>
        set({ bgmVolume: Math.min(1, Math.max(0, volume)) }),

      // SFX 볼륨 설정 (0.0 ~ 1.0)
      setSfxVolume: (volume: number) =>
        set({ sfxVolume: Math.min(1, Math.max(0, volume)) }),

      // 음소거 토글
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    {
      name: 'audio-settings', // 로컬스토리지 키
    }
  )
)
