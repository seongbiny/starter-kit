import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '.env.local 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 설정하세요'
  )
}

/**
 * 타입 안전 Supabase 클라이언트
 * Database 제네릭으로 테이블 타입 자동 추론
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 익명 사용자 - 세션 불필요
  },
})
