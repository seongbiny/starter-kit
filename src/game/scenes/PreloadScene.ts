import Phaser from 'phaser'
import { useUiStore } from '@/stores/uiStore'

/**
 * 에셋 로딩 씬
 * preload()에서 에셋을 로드하고 완료 후 GameScene으로 전환
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload(): void {
    useUiStore.getState().setLoading(true)
    useUiStore.getState().setLoadingProgress(0)

    // 로딩 진행률 → Zustand uiStore 업데이트
    this.load.on('progress', (value: number) => {
      useUiStore.getState().setLoadingProgress(Math.floor(value * 100))
    })

    this.load.on('complete', () => {
      useUiStore.getState().setLoading(false)
    })

    // 에셋 로드 예시 (게임에 맞게 교체):
    // this.load.image('background', '/assets/sprites/background.png')
    // this.load.spritesheet('player', '/assets/sprites/player.png', { frameWidth: 32, frameHeight: 48 })
    // this.load.audio('bgm', '/assets/audio/bgm.mp3')
  }

  create(): void {
    // 로딩 완료 후 GameScene으로 전환
    this.scene.start('GameScene')
  }
}
