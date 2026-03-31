-- 리더보드 테이블 생성
-- 익명 사용자도 점수 등록/조회 가능 (RLS로 보안 설정)

CREATE TABLE IF NOT EXISTS public.leaderboard (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname    TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 2 AND 12),
  score       INTEGER NOT NULL CHECK (score >= 0),
  level       INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 점수 내림차순 인덱스 (리더보드 조회 최적화)
CREATE INDEX IF NOT EXISTS leaderboard_score_idx ON public.leaderboard (score DESC);

-- 생성 시간 인덱스 (최근 기록 조회 최적화)
CREATE INDEX IF NOT EXISTS leaderboard_created_at_idx ON public.leaderboard (created_at DESC);

-- RLS 활성화
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 조회 가능 (읽기 전용 공개)
CREATE POLICY "leaderboard_select_policy"
  ON public.leaderboard
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 정책: 누구나 점수 등록 가능 (익명 포함)
CREATE POLICY "leaderboard_insert_policy"
  ON public.leaderboard
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(nickname) BETWEEN 2 AND 12
    AND score >= 0
    AND level >= 1
  );

-- 정책: 수정/삭제는 불가 (변조 방지)
-- UPDATE, DELETE 정책 없음 = 자동 거부
