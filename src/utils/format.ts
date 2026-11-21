export function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
export function formatPercent(value?: number) { return value === undefined ? '—' : `${(value * 100).toFixed(1)}%` }
export function formatModelScore(value?: number) {
  if (value === undefined || !Number.isFinite(value) || value < 0 || value > 1) return 'Unavailable'
  if (value > 0.999) return '>99.9%'
  if (value < 0.001) return '<0.1%'
  return formatPercent(value)
}
export function riskLevel(value?: number) {
  if (value === undefined) return 'Unavailable'
  if (value >= 0.8) return 'High risk'
  if (value >= 0.5) return 'Elevated risk'
  if (value >= 0.2) return 'Low risk'
  return 'Minimal risk'
}
