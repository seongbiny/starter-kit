import { QueryClient } from '@tanstack/react-query'

/**
 * TanStack Query 클라이언트 설정
 * 리더보드 캐싱, 재시도 정책 포함
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30초간 신선 상태 유지
      gcTime: 5 * 60_000,      // 5분 후 캐시 정리
      retry: 2,                // 실패 시 최대 2회 재시도
      retryDelay: 1000,        // 재시도 간격 1초
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})
