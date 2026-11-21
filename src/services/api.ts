import type { InferenceMode, ModelInfo, ModelMetric, ModeAnalysis, Prediction, ScanResult } from '../types/scan'

const API_URL = ((import.meta.env.VITE_API_URL as string | undefined)?.trim() || 'http://127.0.0.1:8000').replace(/\/+$/, '')
const TIMEOUT_MS = 120000
export const isApiConfigured = Boolean(API_URL)

export class ApiError extends Error {
  kind: 'offline' | 'timeout' | 'http' | 'invalid'
  constructor(message: string, kind: 'offline' | 'timeout' | 'http' | 'invalid') { super(message); this.kind = kind }
}
function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}
function string(value: unknown): string | undefined { return typeof value === 'string' && value.trim() ? value.trim() : undefined }
function probability(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : undefined
}
function prediction(value: unknown): Prediction | undefined {
  const normalized = typeof value === 'string' ? value.trim().toUpperCase() : value
  return normalized === 'PHISHING' || normalized === 1 ? 'PHISHING' : normalized === 'BENIGN' || normalized === 0 ? 'BENIGN' : undefined
}
function modeName(value: string): InferenceMode | undefined {
  const key = value.toLowerCase().replace(/[\s_+-]/g, '')
  if (key === 'url' || key === 'urlonly') return 'URL-only'
  if (key === 'urlhtml') return 'URL + HTML'
  if (key === 'urlimage' || key === 'urlscreenshot') return 'URL + Image'
  if (key === 'full' || key === 'urlhtmlimage' || key === 'urlhtmlscreenshot') return 'Full'
  return undefined
}
function safeImage(value: unknown): string | undefined {
  const image = string(value)
  if (!image) return undefined
  if (/^data:image\/(png|jpeg|webp);base64,/i.test(image)) return image
  try { const url = new URL(image, `${API_URL}/`); return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined } catch { return undefined }
}
function modes(value: unknown): ModeAnalysis[] {
  const entries = Array.isArray(value) ? value.map((item) => [string(object(item)?.mode) ?? '', item] as const) : Object.entries(object(value) ?? {})
  return entries.flatMap<ModeAnalysis>(([key, raw]) => {
    const mode = modeName(key)
    if (!mode) return []
    const data = object(raw)
    if (!data) return [{ mode, available: false }]
    const label = prediction(data.prediction ?? data.label)
    const prob = probability(data.phishing_probability ?? data.phishingProbability ?? data.probability)
    return [{ mode, available: data.available !== false && (data.status === undefined || data.status === 'ok') && Boolean(label), prediction: label, phishingProbability: prob }]
  })
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  if (!API_URL) throw new ApiError('Backend is not configured. Set VITE_API_URL to your FastAPI server.', 'offline')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const signal = init?.signal ? AbortSignal.any([controller.signal, init.signal]) : controller.signal
    const response = await fetch(`${API_URL}${path}`, { ...init, signal, headers: { 'Content-Type': 'application/json', ...init?.headers } })
    if (!response.ok) {
      const body = await response.json().catch(() => null) as unknown
      const detail = object(body)?.detail
      const message = string(detail) ?? (Array.isArray(detail) ? detail.map((item) => string(object(item)?.msg)).filter(Boolean).join('; ') : undefined)
      throw new ApiError(message || `Backend returned HTTP ${response.status}.`, 'http')
    }
    try { return await response.json() as unknown } catch { throw new ApiError('Backend returned invalid JSON.', 'invalid') }
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (controller.signal.aborted || init?.signal?.aborted) throw new ApiError('The request timed out or was cancelled. Please try again.', 'timeout')
    throw new ApiError('Cannot connect to the backend. Check the server and CORS configuration.', 'offline')
  } finally { clearTimeout(timeout) }
}

export async function getHealth(): Promise<boolean> { try { return object(await request('/health'))?.model_loaded === true } catch { return false } }
export async function getModelInfo(): Promise<ModelInfo[]> {
  const raw = await request('/api/v1/model')
  const root = object(raw)
  const items = Array.isArray(raw) ? raw : Array.isArray(root?.models) ? root.models : root ? [root] : []
  return items.flatMap((item): ModelInfo[] => {
    const data = object(item)
    const name = string(data?.architecture)?.startsWith('U-PIG') ? 'U-PIG' : string(data?.name ?? data?.model_name)
    if (!data || !name) return []
    const metricsData = object(data.metrics)
    const metric = (key: string) => probability(metricsData?.[key])
    const metrics: ModelMetric | undefined = metricsData ? { model: name, accuracy: metric('accuracy'), precision: metric('precision'), recall: metric('recall'), f1: metric('f1') ?? metric('f1_score'), source: string(metricsData.source ?? data.metrics_source) } : undefined
    return [{ name, available: data.ready === true, metrics }]
  })
}
export function adaptPrediction(raw: unknown, submittedUrl: string): ScanResult {
  const outer = object(raw)
  const data = object(outer?.result) ?? object(outer?.data) ?? outer
  if (!data) throw new ApiError('Backend returned an invalid prediction response.', 'invalid')
  const label = prediction(data.prediction ?? data.label ?? data.classification)
  if (!label) throw new ApiError('Backend response is missing a valid prediction label.', 'invalid')
  const url = string(data.url) ?? submittedUrl
  let domain: string
  try { domain = new URL(url).hostname } catch { domain = new URL(submittedUrl).hostname }
  const crawl = object(data.crawl)
  const inputMode = string(data.input_mode ?? data.inference_mode ?? data.mode)
  const inferenceMode = inputMode ? modeName(inputMode) : undefined
  const modeResults = modes(data.modes ?? data.mode_results ?? data.analyses)
  if (!modeResults.length && inferenceMode) modeResults.push({ mode: inferenceMode, available: true, prediction: label, phishingProbability: probability(data.phishing_probability) })
  return {
    id: string(outer?.scan_id ?? data.scan_id) ?? crypto.randomUUID(), url, domain, scannedAt: string(outer?.completed_at) ?? new Date().toISOString(), prediction: label,
    phishingProbability: probability(data.phishing_probability ?? data.phishingProbability ?? data.probability),
    modelName: string(data.model_name ?? data.model ?? data.checkpoint) ?? 'U-PIG (Phase 2 Resume)',
    inferenceMode: inputMode ? modeName(inputMode) ?? inputMode : 'Unknown',
    httpStatus: typeof crawl?.http_status === 'number' ? crawl.http_status : typeof data.http_status === 'number' ? data.http_status : undefined,
    crawlStatus: string(crawl?.status ?? data.crawl_status), crawlError: string(crawl?.error),
    screenshotUrl: safeImage(data.screenshot_url ?? data.screenshot),
    htmlStatus: string(data.html_status), screenshotStatus: string(data.screenshot_status),
    warning: string(data.warning), threshold: probability(data.threshold), finalUrl: string(data.final_url),
    modes: modeResults, groundTruth: prediction(data.ground_truth),
  }
}
export async function predictUrl(url: string): Promise<ScanResult> {
  return adaptPrediction(await request('/api/v1/predict', { method: 'POST', body: JSON.stringify({ url }) }), url)
}
export async function scanWebsite(url: string, signal?: AbortSignal): Promise<ScanResult> {
  const deadline = AbortSignal.timeout(180000)
  const scanSignal = signal ? AbortSignal.any([signal, deadline]) : deadline
  let job = object(await request('/api/v1/scans', { method: 'POST', body: JSON.stringify({ url }), signal: scanSignal }))
  const scanId = string(job?.scan_id)
  if (!scanId || !/^[a-f0-9]{32}$/.test(scanId)) throw new ApiError('U-PIG returned an invalid scan ID.', 'invalid')
  while (job) {
    if (job.status === 'completed') return adaptPrediction(job, url)
    if (job.status === 'failed') throw new ApiError(string(job.error) ?? 'U-PIG scan failed.', 'http')
    if (job.status !== 'queued' && job.status !== 'running') throw new ApiError('U-PIG returned an invalid job status.', 'invalid')
    if (scanSignal.aborted) throw new ApiError('U-PIG scan timed out or was cancelled. The backend job may still be running.', 'timeout')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    job = object(await request(`/api/v1/scans/${scanId}`, { signal: scanSignal }))
  }
  throw new ApiError('U-PIG returned an invalid scan response.', 'invalid')
}
