import type { StreakMilestone } from '../utils/streaks'

type StreakBadgeProps = {
  milestone: StreakMilestone
}

const getBadgeClassName = (threshold: number) => {
  if (threshold >= 365) {
    return 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 text-amber-900 ring-1 ring-amber-400/60'
  }

  if (threshold >= 180) {
    return 'bg-rose-100 text-rose-700'
  }

  if (threshold >= 90) {
    return 'bg-red-100 text-red-700'
  }

  if (threshold >= 60) {
    return 'bg-orange-100 text-orange-700'
  }

  if (threshold >= 30) {
    return 'bg-amber-100 text-amber-700'
  }

  if (threshold >= 21) {
    return 'bg-purple-100 text-purple-700'
  }

  if (threshold >= 14) {
    return 'bg-accent-light text-accent'
  }

  if (threshold >= 7) {
    return 'bg-accent-light text-accent'
  }

  return 'bg-surface-tertiary text-content-secondary'
}

export const StreakBadge = ({ milestone }: StreakBadgeProps) => {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        getBadgeClassName(milestone.threshold),
      ].join(' ')}
    >
      🏅 {milestone.label}
    </span>
  )
}
