import { useState } from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';

const VIEWS = ['7D', '30D', 'Forecast'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.payload?.isForecast;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5 font-medium">{label}{isForecast ? ' (Forecast)' : ''}</p>
      {payload.map((p) => (
        p.value != null && (
          <p key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{p.name}</span>
            <span className="font-semibold">{Number(p.value).toFixed(2)} AED</span>
          </p>
        )
      ))}
    </div>
  );
}

export default function PriceChart({ material, forecast, onClose }) {
  const [view, setView] = useState('30D');

  const historyDays = view === '7D' ? 7 : 30;
  const histSlice = (material.priceHistory || []).slice(-historyDays).map((h) => ({
    date: h.date.slice(5), // MM-DD
    price: h.price,
    isForecast: false,
  }));

  const forecastPoints = (forecast?.forecast || []).slice(0, 14).map((f) => ({
    date: f.date.slice(5),
    forecastPrice: f.price,
    upper: f.upper,
    lower: f.lower,
    isForecast: true,
  }));

  const data = view === 'Forecast'
    ? [...histSlice.slice(-7), ...forecastPoints]
    : histSlice;

  const todayLabel = histSlice[histSlice.length - 1]?.date;
  const isUp = material.changePercent > 0;
  const isDown = material.changePercent < 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-5 border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{material.icon}</span>
              <h2 className="text-xl font-bold text-white">{material.name}</h2>
            </div>
            <p className="text-slate-400 text-sm">{material.description} · {material.unit}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Price summary row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Current Price</p>
              <p className="text-xl font-bold text-white">
                {material.currentPrice >= 1000
                  ? material.currentPrice.toLocaleString('en-AE', { maximumFractionDigits: 0 })
                  : material.currentPrice.toFixed(2)}{' '}
                <span className="text-sm font-normal text-slate-400">AED</span>
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Today's Change</p>
              <p className={`text-xl font-bold flex items-center gap-1 ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
                {isUp ? <TrendingUp size={16} /> : isDown ? <TrendingDown size={16} /> : <Minus size={16} />}
                {material.changePercent > 0 ? '+' : ''}{material.changePercent?.toFixed(2)}%
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">7-Day Outlook</p>
              <p className={`text-xl font-bold capitalize ${
                forecast?.trend === 'bullish' ? 'text-emerald-400' :
                forecast?.trend === 'bearish' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {forecast?.trend || 'stable'} {forecast?.sevenDayChange > 0 ? '+' : ''}{forecast?.sevenDayChange}%
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex gap-1 mb-4 bg-slate-800 p-1 rounded-lg w-fit">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  view === v
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v.toFixed(0)}
                  domain={['auto', 'auto']}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                {view === 'Forecast' && todayLabel && (
                  <ReferenceLine x={todayLabel} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'Today', fill: '#94a3b8', fontSize: 10 }} />
                )}
                {view !== 'Forecast' && (
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#priceGrad)"
                    name="Price"
                    dot={false}
                  />
                )}
                {view === 'Forecast' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Historical"
                      connectNulls
                    />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="url(#ciGrad)"
                      name="Upper CI"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="none"
                      fill="#0f172a"
                      name="Lower CI"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecastPrice"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={false}
                      name="Forecast"
                      connectNulls
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {view === 'Forecast' && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Shaded area represents 95% confidence interval · Holt's double exponential smoothing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
