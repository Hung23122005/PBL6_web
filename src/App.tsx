import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })))
const Scanner = lazy(() => import('./pages/Scanner').then((module) => ({ default: module.Scanner })))
const History = lazy(() => import('./pages/History').then((module) => ({ default: module.History })))
const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })))

function ScannerRoute() { const location = useLocation(); return <Scanner key={location.key} /> }

export default function App() {
  return <ErrorBoundary><BrowserRouter><AppLayout><Suspense fallback={<div className="page-skeleton" role="status" aria-label="Loading page"><i /><i /><i /></div>}><Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/scanner" element={<ScannerRoute />} />
    <Route path="/history" element={<History />} />
    <Route path="/about" element={<About />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></AppLayout></BrowserRouter></ErrorBoundary>
}
