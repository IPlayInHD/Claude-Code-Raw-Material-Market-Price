import { useState } from 'react';
import { Activity, BarChart2, Bell, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import Dashboard from './components/Dashboard';
import MarketSummary from './components/MarketSummary';
import AlertPanel from './components/AlertPanel';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
  { id: 'market', label: 'Market Summary', icon: TrendingUp },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

function formatTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { materials, forecasts, summary, connected, lastUpdate, flashMap } = useSocket();

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30">
                <Activity size={18} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">
                  UAE Raw Material Market
                </h1>
                <p className="text-xs text-slate-500">Live Price Forecasting Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <span>Last update:</span>
                <span className="font-mono text-slate-300">{formatTime(lastUpdate)}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                connected
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : 'text-red-400 border-red-500/30 bg-red-500/10'
              }`}>
                {connected ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
                    <Wifi size={11} />
                    LIVE
                  </>
                ) : (
                  <>
                    <WifiOff size={11} />
                    OFFLINE
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 mt-3 -mb-px">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={13} />
                {label}
                {id === 'alerts' && (
                  <span className="ml-0.5 w-4 h-4 rounded-full bg-slate-700 text-slate-400 text-[10px] flex items-center justify-center">
                    {JSON.parse(localStorage.getItem('uae_price_alerts') || '[]').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Ticker bar */}
      {materials.length > 0 && (
        <div className="bg-slate-900/80 border-b border-slate-800 overflow-hidden">
          <div className="flex items-center" style={{ animation: 'none' }}>
            <div className="flex gap-6 px-4 py-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
              {materials.map((m) => {
                const isUp = m.changePercent > 0;
                const isDown = m.changePercent < 0;
                return (
                  <span key={m.id} className="inline-flex items-center gap-1.5 text-xs flex-shrink-0">
                    <span className="text-slate-400">{m.name}</span>
                    <span className="text-slate-100 font-medium font-mono">
                      {m.currentPrice >= 1000
                        ? m.currentPrice.toLocaleString('en-AE', { maximumFractionDigits: 0 })
                        : m.currentPrice.toFixed(2)} AED
                    </span>
                    <span className={`font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-500'}`}>
                      {isUp ? '▲' : isDown ? '▼' : '—'}{Math.abs(m.changePercent || 0).toFixed(2)}%
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!connected && materials.length === 0 && (
          <div className="card p-8 text-center mb-6">
            <Activity size={40} className="mx-auto mb-4 text-slate-600 animate-pulse" />
            <h2 className="text-lg font-semibold text-slate-300 mb-2">Connecting to Market Feed...</h2>
            <p className="text-slate-500 text-sm">
              Make sure the backend server is running on port 3001.
              <br />
              <code className="text-xs bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">
                cd backend && npm start
              </code>
            </p>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard materials={materials} forecasts={forecasts} flashMap={flashMap} />
        )}
        {activeTab === 'market' && (
          <MarketSummary summary={summary} materials={materials} />
        )}
        {activeTab === 'alerts' && (
          <AlertPanel materials={materials} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>UAE Raw Material Market Price Dashboard — For contractors & procurement teams</p>
          <p>Prices simulated for demonstration · Not financial advice · Prices in AED</p>
        </div>
      </footer>
    </div>
  );
}
