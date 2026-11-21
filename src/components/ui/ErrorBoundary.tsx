import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Application error', error, info) }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="fatal"><ShieldAlert size={42} /><h1>Something went wrong</h1><p>Refresh the page to continue. Your saved scan history is still on this device.</p><button className="button primary" onClick={() => window.location.reload()}>Refresh page</button></main>
  }
}
