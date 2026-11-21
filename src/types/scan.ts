export type Prediction = 'PHISHING' | 'BENIGN'
export type InferenceMode = 'URL-only' | 'URL + HTML' | 'URL + Image' | 'Full'
export interface ModeAnalysis { mode: InferenceMode; available: boolean; prediction?: Prediction; phishingProbability?: number }
export interface ScanResult {
  id: string; url: string; domain: string; scannedAt: string; prediction: Prediction
  phishingProbability?: number; modelName: string; inferenceMode: string
  httpStatus?: number; crawlStatus?: string; crawlError?: string; screenshotUrl?: string
  htmlStatus?: string; screenshotStatus?: string; warning?: string; threshold?: number; finalUrl?: string
  modes: ModeAnalysis[]; groundTruth?: Prediction
}
export interface ModelMetric { model: string; accuracy?: number; precision?: number; recall?: number; f1?: number; source?: string }
export interface ModelInfo { name: string; available: boolean; metrics?: ModelMetric }
