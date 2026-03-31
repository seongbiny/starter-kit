import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { usePlayerStore } from '@/stores/playerStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// 점수 제출 폼 스키마
const scoreSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(12, '닉네임은 12자 이하이어야 합니다')
    .regex(/^[a-zA-Z0-9가-힣_]+$/, '영문, 숫자, 한글, 언더스코어만 사용 가능합니다'),
})

type ScoreFormValues = z.infer<typeof scoreSchema>

interface ScoreSubmitFormProps {
  score: number
  level: number
}

/**
 * 점수 제출 폼 컴포넌트
 * React Hook Form + Zod 검증
 */
export function ScoreSubmitForm({ score, level }: ScoreSubmitFormProps) {
  const { submitScore, isSubmitting, isSubmitSuccess, submitError } = useLeaderboard()
  const { nickname: savedNickname, setNickname } = usePlayerStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      nickname: savedNickname,
    },
  })

  const onSubmit = (data: ScoreFormValues) => {
    setNickname(data.nickname)
    submitScore({ nickname: data.nickname, score, level })
  }

  if (isSubmitSuccess) {
    return (
      <div className="flex items-center gap-2 py-4 text-game-success justify-center">
        <CheckCircle size={20} />
        <span>점수가 등록되었습니다!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="nickname">닉네임으로 점수 등록</Label>
        <div className="flex gap-2">
          <Input
            id="nickname"
            placeholder="닉네임 입력"
            {...register('nickname')}
            className="pointer-events-auto"
          />
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
            className="pointer-events-auto shrink-0"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : '등록'}
          </Button>
        </div>
        {errors.nickname && (
          <p className="text-game-danger text-xs">{errors.nickname.message}</p>
        )}
        {submitError && (
          <p className="text-game-danger text-xs">{submitError.message}</p>
        )}
      </div>
    </form>
  )
}
