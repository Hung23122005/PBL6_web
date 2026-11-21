import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Clock3, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHistory } from '../hooks/useHistory'
import { clearHistory, deleteScan } from '../services/history'
import { EmptyState, PredictionBadge } from '../components/ui/Shared'
import { formatDate, formatModelScore } from '../utils/format'
import type { Prediction } from '../types/scan'

export function History() {
  const scans = useHistory()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'ALL' | Prediction>('ALL')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [confirmOpen, setConfirmOpen] = useState(false)
  useEffect(() => {
    if (!confirmOpen) return
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setConfirmOpen(false) }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [confirmOpen])
  const filtered = useMemo(() => scans.filter((scan) => scan.url.toLowerCase().includes(query.toLowerCase()) && (filter === 'ALL' || scan.prediction === filter)).sort((a, b) => sort === 'newest' ? Date.parse(b.scannedAt) - Date.parse(a.scannedAt) : Date.parse(a.scannedAt) - Date.parse(b.scannedAt)), [scans, query, filter, sort])
  return <div><div className="page-intro"><div><span className="eyebrow"><span className="eyebrow-line" /> SCAN RECORDS</span><h1>Scan History</h1><p>Explore previous results saved in this browser. URL query strings are excluded from saved records.</p></div>{scans.length > 0 && <button className="button danger-button" onClick={() => setConfirmOpen(true)}><Trash2 size={16} /> Clear History</button>}</div>
    <section className="panel history-panel"><div className="history-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Search by URL" placeholder="Search by URL or domain…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="filters"><SlidersHorizontal size={17} /><select aria-label="Filter prediction" value={filter} onChange={(event) => setFilter(event.target.value as 'ALL' | Prediction)}><option value="ALL">All results</option><option value="PHISHING">Phishing</option><option value="BENIGN">Benign</option></select><select aria-label="Sort scan time" value={sort} onChange={(event) => setSort(event.target.value as 'newest' | 'oldest')}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></div></div><div className="history-count">{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</div>{filtered.length ? <div className="table-scroll"><table className="data-table history-table"><thead><tr><th>Website</th><th>Prediction</th><th>Phishing model score</th><th>Model / mode</th><th>Scan time</th><th aria-label="Actions" /></tr></thead><tbody>{filtered.map((scan) => <tr key={scan.id}><td><span className="table-domain-icon">◎</span><span className="table-main">{scan.domain}<small>{scan.url}</small></span></td><td><PredictionBadge value={scan.prediction} /></td><td>{formatModelScore(scan.phishingProbability)}</td><td><span className="table-main">{scan.modelName}<small>{scan.inferenceMode}</small></span></td><td>{formatDate(scan.scannedAt)}</td><td><div className="table-actions"><Link className="table-action" to="/scanner" state={{ scan }} aria-label={`View details for ${scan.domain}`}><ArrowUpRight size={16} /></Link><button type="button" className="table-action table-delete" onClick={() => deleteScan(scan.id)} aria-label={`Delete scan for ${scan.domain} at ${formatDate(scan.scannedAt)}`} title="Delete scan"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={<Clock3 size={25} />} title={scans.length ? 'No matching scans' : 'Your history is empty'} description={scans.length ? 'Try a different search or filter.' : 'Results from successful backend scans will appear here.'} action={scans.length ? undefined : 'Open scanner'} to="/scanner" />}</section>
    {confirmOpen && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmOpen(false) }}><div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="clear-title" aria-describedby="clear-description"><button className="icon-button dialog-close" onClick={() => setConfirmOpen(false)} aria-label="Close dialog"><X size={19} /></button><div className="dialog-icon"><Trash2 size={24} /></div><h2 id="clear-title">Clear scan history?</h2><p id="clear-description">This permanently removes {scans.length} saved {scans.length === 1 ? 'result' : 'results'} from this browser.</p><div className="dialog-actions"><button className="button secondary" onClick={() => setConfirmOpen(false)}>Cancel</button><button className="button danger-solid" onClick={() => { clearHistory(); setConfirmOpen(false) }}>Clear History</button></div></div></div>}
  </div>
}
