import { numberToCurrency } from './numberToCurrency'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export type DeadlineInfo = {
  deadlineLabel: string
  daysRemaining: number
  monthsRemaining: number
  remainingAmount: number
  monthlyContribution: number
  monthlyContributionLabel: string
  isOverdue: boolean
}

export function deadlineInfo(
  targetDate: string | null,
  current: number,
  amount: number,
): DeadlineInfo | null {
  if (!targetDate) return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const deadline = new Date(targetDate)
  deadline.setHours(0, 0, 0, 0)

  const daysRemaining = Math.round((deadline.getTime() - now.getTime()) / MS_PER_DAY)
  const monthsRemaining = Math.max(1, Math.round(daysRemaining / 30))
  const remainingAmount = Math.max(0, amount - current)
  const monthlyContribution = remainingAmount / monthsRemaining

  return {
    deadlineLabel: deadline.toLocaleDateString('pt-BR'),
    daysRemaining,
    monthsRemaining,
    remainingAmount,
    monthlyContribution,
    monthlyContributionLabel: numberToCurrency(monthlyContribution),
    isOverdue: daysRemaining < 0,
  }
}
