import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowRight, Globe2, LockKeyhole, Radar, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { scanWebsite } from '../services/api'
import { addScan } from '../services/history'
import type { ScanResult } from '../types/scan'
import { ScanResultView } from '../components/scanner/ScanResultView'

function validateUrl(input: string): string | null {
  try { const url = new URL(input.trim()); return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname ? url.href : null } catch { return null }
}
export function Scanner() {
  const location = useLocation()
  const saved = (location.state as { scan?: ScanResult } | null)?.scan
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ScanResult | null>(saved ?? null)
  const [historical, setHistorical] = useState(Boolean(saved))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const activeScan = useRef<AbortController | null>(null)
  useEffect(() => () => activeScan.current?.abort(), [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const normalized = validateUrl(url)
    if (!normalized) { setError('Enter a valid URL starting with https:// or http://.'); return }
    setResult(null); setHistorical(false); setLoading(true)
    const controller = new AbortController()
    activeScan.current = controller
    try { const scan = await scanWebsite(normalized, controller.signal); if (!controller.signal.aborted) { setResult(scan); addScan(scan) } }
    catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Scan failed. Please try again.') }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }
  function reset() { setResult(null); setUrl(''); setError(''); setHistorical(false) }
  return <div className="scanner-page">
    <div className="scanner-heading"><span className="eyebrow"><span className="eyebrow-line" /> AI-POWERED THREAT ANALYSIS</span><h1>Is This Website <em>Safe?</em></h1><p>Submit a URL to automatically collect HTML and a website screenshot, then analyze them with the connected model.</p></div>
    <section className="scan-box" aria-label="Website scanner"><div className="scan-box-top"><div className="scan-box-icon"><Radar size={23} /></div><div><strong>Website URL Scanner</strong><span>Automatically crawl HTML and capture a screenshot</span></div><span className="scan-box-tag"><Sparkles size={13} /> AI ANALYSIS</span></div><form onSubmit={submit} noValidate><label htmlFor="scan-url">Website URL</label><div className="scan-input-wrap"><Globe2 size={21} /><input id="scan-url" type="url" inputMode="url" autoComplete="url" placeholder="https://example.com" value={url} onChange={(event) => { setUrl(event.target.value); if (error) setError('') }} aria-invalid={Boolean(error)} aria-describedby={error ? 'scan-error' : 'scan-hint'} disabled={loading} /><button className="button primary" type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Scan Website'}{!loading && <ArrowRight size={17} />}</button></div><div className="input-meta"><span id="scan-hint"><LockKeyhole size={14} /> URL sent only to your configured backend</span><span>HTTP & HTTPS supported</span></div>{error && <p id="scan-error" className="form-error" role="alert">{error}</p>}</form></section>
    {loading && <div className="scan-loading" role="status"><div className="scan-orbit"><Radar size={30} /></div><h2>Analyzing website…</h2><p>Waiting for the U-PIG scan job to collect HTML and a screenshot, then run inference. This may take up to three minutes.</p><div className="loading-bars"><i /><i /><i /></div></div>}
    {result && <div className="scan-output"><div className="output-head"><div><span className="eyebrow">ANALYSIS COMPLETE</span><h2>Scan result</h2></div><button className="button secondary" onClick={reset}><RotateCcw size={16} />Scan Again</button></div><ScanResultView result={result} historical={historical} /></div>}
    {!result && !loading && <div className="scanner-benefits"><div><ShieldCheck size={20} /><span>Model-backed verdict</span></div><div><Globe2 size={20} /><span>Automatic HTML & screenshot</span></div><div><Radar size={20} /><span>Multimodal analysis</span></div></div>}
  </div>
}
