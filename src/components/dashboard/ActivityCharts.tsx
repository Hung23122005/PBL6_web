import { Cell, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState } from 'react'
import { Activity, ChartPie } from 'lucide-react'
import type { ScanResult } from '../../types/scan'
import { EmptyState, SectionHead } from '../ui/Shared'

export function ActivityCharts({ scans }: { scans: ScanResult[] }) {
  const [today] = useState(() => new Date())
  const phishing = scans.filter((item) => item.prediction === 'PHISHING').length
  const benign = scans.length - phishing
  const pieData = [{ name: 'Phishing', value: phishing }, { name: 'Benign', value: benign }]
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - 6 + index)
    return { key: date.toDateString(), day: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date), scans: 0 }
  })
  scans.forEach((item) => { const date = new Date(item.scannedAt); const day = days.find((entry) => entry.key === date.toDateString()); if (day) day.scans++ })
  return <div className="chart-grid"><section className="panel chart-panel"><SectionHead eyebrow="ACTIVITY" title="Scan volume" /><p className="panel-subtitle">Scans performed in this browser over the last 7 days</p>{scans.length ? <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><LineChart data={days} margin={{ top: 16, right: 8, bottom: 0, left: -28 }}><CartesianGrid stroke="#24334c" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="day" tick={{ fill: '#7e91ad', fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#7e91ad', fontSize: 12 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#14223a', border: '1px solid #2b3d59', borderRadius: 10, color: '#eaf4ff' }} /><Line type="monotone" dataKey="scans" name="Scans" stroke="#38c9ed" strokeWidth={3} dot={{ fill: '#38c9ed', stroke: '#0b1629', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} /></LineChart></ResponsiveContainer></div> : <EmptyState icon={<Activity size={24} />} title="No scan activity yet" description="Scan a website to see activity over time." action="Open scanner" to="/scanner" />}</section><section className="panel chart-panel"><SectionHead eyebrow="DISTRIBUTION" title="Scan outcomes" /><p className="panel-subtitle">Classification of saved results</p>{scans.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={93} stroke="none" paddingAngle={3}>{pieData.map((item) => <Cell key={item.name} fill={item.name === 'Phishing' ? '#fb6d77' : '#31cf9b'} />)}</Pie><Tooltip contentStyle={{ background: '#14223a', border: '1px solid #2b3d59', borderRadius: 10, color: '#eaf4ff' }} /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{scans.length}</strong><span>TOTAL SCANS</span></div></div><div className="chart-legend"><span><i className="legend-dot danger" />Phishing <strong>{phishing}</strong></span><span><i className="legend-dot success" />Benign <strong>{benign}</strong></span></div></> : <EmptyState icon={<ChartPie size={24} />} title="No outcomes to chart" description="Results will appear here after your first successful scan." action="Open scanner" to="/scanner" />}</section></div>
}
