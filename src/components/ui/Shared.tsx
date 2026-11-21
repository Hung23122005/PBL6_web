import { ArrowRight, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Prediction } from '../../types/scan'

export function SectionHead({ eyebrow, title, action, to }: { eyebrow?: string; title: string; action?: string; to?: string }) {
  return <div className="section-head"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action && to && <Link className="text-link" to={to}>{action}<ArrowRight size={15} /></Link>}</div>
}
export function EmptyState({ icon, title, description, action, to }: { icon?: ReactNode; title: string; description: string; action?: string; to?: string }) {
  return <div className="empty-state"><div className="empty-icon">{icon ?? <Inbox size={25} />}</div><h3>{title}</h3><p>{description}</p>{action && to && <Link className="button secondary" to={to}>{action}<ArrowRight size={16} /></Link>}</div>
}
export function PredictionBadge({ value }: { value: Prediction }) { return <span className={`prediction-badge ${value.toLowerCase()}`}><span className="status-dot" />{value}</span> }
