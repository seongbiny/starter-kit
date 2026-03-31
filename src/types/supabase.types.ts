// supabase gen types typescript 로 자동 생성되는 파일입니다.
// 실제 프로젝트 ID로 다음 명령 실행:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leaderboard: {
        Row: {
          id: string
          nickname: string
          score: number
          level: number
          created_at: string
        }
        Insert: {
          id?: string
          nickname: string
          score: number
          level: number
          created_at?: string
        }
        Update: {
          id?: string
          nickname?: string
          score?: number
          level?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
