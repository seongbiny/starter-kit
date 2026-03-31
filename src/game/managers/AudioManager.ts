import { Howl, Howler } from 'howler'
import { useAudioStore } from '@/stores/audioStore'

interface SoundInstance {
  howl: Howl
  id?: number
}

/**
 * Howler.js 래퍼 - BGM/효과음 재생 관리
 * React DOM 레이어와 독립적으로 동작
 */
export class AudioManager {
  private sounds = new Map<string, SoundInstance>()
  private currentBgm: string | null = null

  constructor() {
    this.syncWithStore()
  }

  /**
   * Zustand audioStore와 볼륨/음소거 동기화
   */
  private syncWithStore(): void {
    const { bgmVolume, isMuted } = useAudioStore.getState()
    Howler.volume(isMuted ? 0 : bgmVolume)

    // 스토어 변경 구독
    useAudioStore.subscribe((state) => {
      Howler.mute(state.isMuted)
      if (!state.isMuted) {
        Howler.volume(state.bgmVolume)
      }
    })
  }

  /**
   * 사운드 등록
   */
  register(alias: string, src: string | string[], loop = false): void {
    const howl = new Howl({
      src: Array.isArray(src) ? src : [src],
      loop,
      preload: true,
    })
    this.sounds.set(alias, { howl })
  }

  /**
   * BGM 재생 (이전 BGM 자동 페이드아웃)
   */
  playBgm(alias: string, fadeDuration = 1000): void {
    if (this.currentBgm === alias) return

    // 이전 BGM 페이드아웃
    if (this.currentBgm) {
      this.fadeOut(this.currentBgm, fadeDuration)
    }

    const instance = this.sounds.get(alias)
    if (!instance) return

    const { bgmVolume, isMuted } = useAudioStore.getState()
    instance.howl.volume(isMuted ? 0 : bgmVolume)
    instance.id = instance.howl.play()
    instance.howl.fade(0, isMuted ? 0 : bgmVolume, fadeDuration, instance.id)

    this.currentBgm = alias
  }

  /**
   * 효과음 재생 (원샷)
   */
  playSfx(alias: string): void {
    const instance = this.sounds.get(alias)
    if (!instance) return

    const { sfxVolume, isMuted } = useAudioStore.getState()
    instance.howl.volume(isMuted ? 0 : sfxVolume)
    instance.howl.play()
  }

  /**
   * 특정 사운드 페이드아웃 후 정지
   */
  private fadeOut(alias: string, duration: number): void {
    const instance = this.sounds.get(alias)
    if (!instance || instance.id === undefined) return

    instance.howl.fade(instance.howl.volume(), 0, duration, instance.id)
    setTimeout(() => instance.howl.stop(), duration)
  }

  /**
   * 모든 사운드 정지
   */
  stopAll(): void {
    Howler.stop()
    this.currentBgm = null
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    this.sounds.forEach(({ howl }) => howl.unload())
    this.sounds.clear()
    this.currentBgm = null
  }
}
