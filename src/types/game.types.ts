// 게임 화면 종류
export type GameScreen = 'menu' | 'game' | 'leaderboard' | 'settings'

// 게임 상태
export type GameStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'gameover'

// 씬 전환 방향
export type SceneTransition = 'fade' | 'slide' | 'none'

// 게임 설정
export interface GameConfig {
  width: number
  height: number
  backgroundColor: number
  antialias: boolean
  resolution: number
}

// 리더보드 항목
export interface LeaderboardEntry {
  id: string
  nickname: string
  score: number
  level: number
  created_at: string
}

// 점수 제출 데이터
export interface ScoreSubmitData {
  nickname: string
  score: number
  level: number
}

// 플레이어 상태
export interface PlayerState {
  nickname: string
  bestScore: number
}

// 게임 상태 (Zustand Store용)
export interface GameState {
  score: number
  level: number
  lives: number
  isPaused: boolean
  isGameOver: boolean
  status: GameStatus

  // 액션
  addScore: (points: number) => void
  setLevel: (level: number) => void
  loseLife: () => void
  setPaused: (paused: boolean) => void
  setGameOver: () => void
  resetGame: () => void
  setStatus: (status: GameStatus) => void
}

// UI 상태 (Zustand Store용)
export interface UiState {
  currentScreen: GameScreen
  isLoading: boolean
  loadingProgress: number
  loadingMessage: string

  // 액션
  setScreen: (screen: GameScreen) => void
  setLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void
  setLoadingMessage: (message: string) => void
}

// 오디오 상태 (Zustand Store용)
export interface AudioState {
  bgmVolume: number
  sfxVolume: number
  isMuted: boolean

  // 액션
  setBgmVolume: (volume: number) => void
  setSfxVolume: (volume: number) => void
  toggleMute: () => void
}

// 플레이어 스토어 상태
export interface PlayerStoreState {
  nickname: string
  bestScore: number

  // 액션
  setNickname: (nickname: string) => void
  updateBestScore: (score: number) => void
}

// 씬 기반 클래스용 인터페이스
export interface IScene {
  onEnter(): Promise<void>
  onExit(): void
  update(deltaTime: number): void
}

// 에셋 매니저용 타입
export type AssetType = 'texture' | 'spritesheet' | 'sound' | 'font'

export interface AssetEntry {
  alias: string
  src: string
  type?: AssetType
}

// 입력 이벤트 타입
export interface InputState {
  keys: Set<string>
  isPointerDown: boolean
  pointerPosition: { x: number; y: number }
}
