import type { ScanResult } from '../types/scan'
const KEY = 'phishguard.scan-history.v1'
const EVENT = 'phishguard:history-changed'
const LIMIT = 100
function safeStoredUrl(value: string): string {
  try { const url = new URL(value); return `${url.origin}${url.pathname}` } catch { return value.split(/[?#]/)[0] }
}
function valid(item: unknown): item is ScanResult {
  if (!item || typeof item !== 'object') return false
  const row = item as Partial<ScanResult>
  return typeof row.id === 'string' && typeof row.url === 'string' && typeof row.scannedAt === 'string' && (row.prediction === 'PHISHING' || row.prediction === 'BENIGN')
}
export function readHistory(): ScanResult[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(data) ? data.filter(valid).map((item) => ({
      ...item,
      domain: typeof item.domain === 'string' ? item.domain : safeStoredUrl(item.url),
      modelName: typeof item.modelName === 'string' ? item.modelName : 'Backend model',
      inferenceMode: typeof item.inferenceMode === 'string' ? item.inferenceMode : 'Unknown',
      modes: Array.isArray(item.modes) ? item.modes : [],
      screenshotUrl: undefined,
    })) : []
  } catch { return [] }
}
function write(items: ScanResult[]) { try { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new Event(EVENT)) } catch { /* storage disabled or full */ } }
export function addScan(result: ScanResult) {
  const stored: ScanResult = { ...result, url: safeStoredUrl(result.url), screenshotUrl: undefined }
  write([stored, ...readHistory()].slice(0, LIMIT))
}
export function clearHistory() { write([]) }
export function deleteScan(id: string) { write(readHistory().filter((scan) => scan.id !== id)) }
export function subscribeHistory(callback: () => void) {
  window.addEventListener(EVENT, callback); window.addEventListener('storage', callback)
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener('storage', callback) }
}
