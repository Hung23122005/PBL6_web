import { ArrowRight, ArrowUpRight, CheckCircle2, Crosshair, Radar, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useHistory } from '../hooks/useHistory'
import { deleteScan } from '../services/history'
import { ActivityCharts } from '../components/dashboard/ActivityCharts'
import { EmptyState, PredictionBadge, SectionHead } from '../components/ui/Shared'
import { formatDate, formatModelScore, formatPercent } from '../utils/format'

export function Dashboard() {
  const scans = useHistory()
  const phishing = scans.filter((scan) => scan.prediction === 'PHISHING').length
  const benign = scans.length - phishing
  const labeled = scans.filter((scan) => scan.groundTruth)
  const detectionRate = labeled.length ? labeled.filter((scan) => scan.prediction === scan.groundTruth).length / labeled.length : undefined
  const stats = [
    { label: 'TOTAL SCANS', value: scans.length.toLocaleString(), icon: Radar, tone: 'cyan', note: 'Saved in this browser' },
    { label: 'PHISHING DETECTED', value: phishing.toLocaleString(), icon: ShieldAlert, tone: 'red', note: 'Flagged by backend model' },
    { label: 'BENIGN DETECTED', value: benign.toLocaleString(), icon: ShieldCheck, tone: 'green', note: 'Classified by backend model' },
    { label: 'DETECTION RATE', value: formatPercent(detectionRate), icon: Crosshair, tone: 'violet', note: labeled.length ? `${labeled.length} labeled scans` : 'Needs ground truth labels' },
  ]
  return <div className="dashboard-page"><div className="page-intro"><div><span className="eyebrow"><span className="eyebrow-line" /> SECURITY OVERVIEW</span><h1>Dashboard</h1><p>Monitor your phishing analysis activity and recent results.</p></div><Link className="button primary" to="/scanner"><Radar size={17} /> New Scan <ArrowRight size={16} /></Link></div>
    <section className="welcome-banner"><div className="welcome-art"><div className="welcome-ring ring-one" /><div className="welcome-ring ring-two" /><ShieldCheck size={58} /></div><div className="welcome-copy"><span className="eyebrow">PHISHGUARD AI PLATFORM</span><h2>Stay one step ahead of phishing.</h2><p>Analyze suspicious websites with AI and keep a record of every result on this device.</p><Link to="/scanner">Start a website scan <ArrowUpRight size={16} /></Link></div><span className="banner-coordinate">PG—01 / THREAT INTELLIGENCE</span></section>
    <div className="stats-grid">{stats.map(({ label, value, icon: Icon, tone, note }) => <article className="stat-card" key={label}><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}><Icon size={19} /></div></div><strong>{value}</strong><p>{note}</p></article>)}</div>
    <ActivityCharts scans={scans} />
    <section className="panel recent-panel"><SectionHead eyebrow="LATEST RESULTS" title="Recent scan activity" action="View all history" to="/history" />{scans.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Website</th><th>Prediction</th><th>Phishing score</th><th>Scanned</th><th aria-label="Actions" /></tr></thead><tbody>{scans.slice(0, 5).map((scan) => <tr key={scan.id}><td><span className="table-domain-icon"><GlobeIcon /></span><span className="table-main">{scan.domain}<small>{scan.url}</small></span></td><td><PredictionBadge value={scan.prediction} /></td><td>{formatModelScore(scan.phishingProbability)}</td><td>{formatDate(scan.scannedAt)}</td><td><div className="table-actions"><Link className="table-action" to="/scanner" state={{ scan }} aria-label={`View details for ${scan.domain}`}><ArrowUpRight size={16} /></Link><button type="button" className="table-action table-delete" onClick={() => deleteScan(scan.id)} aria-label={`Delete scan for ${scan.domain} at ${formatDate(scan.scannedAt)}`} title="Delete scan"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={<CheckCircle2 size={24} />} title="No scans recorded" description="Successful scans will appear here and in your history." action="Scan a website" to="/scanner" />}</section>
  </div>
}
function GlobeIcon() { return <span className="globe-glyph">◎</span> }
