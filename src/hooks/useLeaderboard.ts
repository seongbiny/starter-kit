import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { LeaderboardEntry, ScoreSubmitData } from '@/types/game.types'

const LEADERBOARD_KEY = ['leaderboard']
const TOP_N = 10

/**
 * 리더보드 상위 N개 fetch
 */
async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(TOP_N)

  if (error) throw new Error(error.message)
  return data as LeaderboardEntry[]
}

/**
 * 점수 제출
 */
async function submitScore(data: ScoreSubmitData): Promise<LeaderboardEntry> {
  const { data: inserted, error } = await supabase
    .from('leaderboard')
    .insert([data])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return inserted as LeaderboardEntry
}

/**
 * 리더보드 훅
 * - useQuery: 상위 10개 자동 fetch + 캐싱
 * - useMutation: 점수 제출 후 캐시 자동 갱신
 */
export function useLeaderboard() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: LEADERBOARD_KEY,
    queryFn: fetchLeaderboard,
    staleTime: 30_000, // 30초간 신선 상태 유지
    refetchOnWindowFocus: false,
  })

  const mutation = useMutation({
    mutationFn: submitScore,
    onSuccess: () => {
      // 제출 성공 시 리더보드 자동 갱신
      void queryClient.invalidateQueries({ queryKey: LEADERBOARD_KEY })
    },
  })

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    submitScore: mutation.mutate,
    isSubmitting: mutation.isPending,
    submitError: mutation.error,
    isSubmitSuccess: mutation.isSuccess,
  }
}
