import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Activity, ArrowUpRight, ChartNoAxesCombined, Clock3, Info, Menu, Radar, ShieldCheck, X } from 'lucide-react'
import { getHealth, isApiConfigured } from '../../services/api'

const navigation = [
  { to: '/', label: 'Dashboard', icon: ChartNoAxesCombined, end: true },
  { to: '/scanner', label: 'Website Scanner', icon: Radar },
  { to: '/history', label: 'Scan History', icon: Clock3 },
  { to: '/about', label: 'About Project', icon: Info },
]
const titleByPath: Record<string, string> = { '/': 'Dashboard', '/scanner': 'Website Scanner', '/history': 'Scan History', '/about': 'About Project' }

export function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [online, setOnline] = useState(false)
  const location = useLocation()
  useEffect(() => {
    if (!isApiConfigured) return
    let mounted = true
    const check = () => { void getHealth().then((value) => { if (mounted) setOnline(value) }) }
    check(); const timer = window.setInterval(check, 30000)
    return () => { mounted = false; window.clearInterval(timer) }
  }, [])
  const status = !isApiConfigured ? 'Not configured' : online ? 'Backend online' : 'Backend offline'
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    {menuOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
      <div className="brand"><div className="brand-mark"><ShieldCheck size={23} strokeWidth={2.2} /></div><div><strong>PhishGuard<span> AI</span></strong><small>INTELLIGENT DEFENSE</small></div><button className="icon-button sidebar-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
      <div className="sidebar-content"><p className="nav-label">WORKSPACE</p><nav className="nav-list">{navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.9} /><span>{label}</span>{to === '/scanner' && <ArrowUpRight className="nav-trail" size={15} />}</NavLink>)}</nav></div>
      <div className="sidebar-bottom"><div className="system-card"><div className="system-icon"><Activity size={18} /></div><div><span className="system-label">SYSTEM STATUS</span><strong className={online ? 'online-text' : 'muted-text'}>{status}</strong></div><span className={`connection-light ${online ? 'online' : ''}`} /></div><p className="sidebar-foot">PHISHGUARD AI <span>•</span> RESEARCH PLATFORM</p></div>
    </aside>
    <div className="main-column"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={22} /></button><span className="topbar-section">PLATFORM</span><span className="topbar-separator">/</span><strong>{titleByPath[location.pathname] ?? 'Dashboard'}</strong></div><div className="topbar-right"><span className={`topbar-status ${online ? 'online' : ''}`}><span className="status-dot" />{status}</span><div className="avatar" aria-label="PhishGuard AI">PG</div></div></header><main id="main-content" className="page-content">{children}</main><footer className="footer"><span>© PhishGuard AI</span><span>Research platform · AI predictions may be incorrect</span></footer></div>
  </div>
}
