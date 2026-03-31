import { Routes, Route, Navigate } from 'react-router'
import { MenuPage } from '@/pages/MenuPage'
import { GamePage } from '@/pages/GamePage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'

/**
 * 앱 라우팅 루트
 * React Router v7 사용
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      {/* 없는 경로는 메뉴로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
