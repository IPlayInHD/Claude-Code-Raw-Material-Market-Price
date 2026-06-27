import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import {
  LineChart, Line, ResponsiveContainer, Tooltip,
} from 'recharts';
import PriceChart from './PriceChart';

const CATEGORY_COLORS = {
  Metals: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  Aggregates: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Building Materials': { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Pipes & Insulation': { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

export default function MaterialCard({ material, forecast, flashClass }) {
  const [showChart, setShowChart] = useState(false);

  if (!material) return null;

  const isUp = material.changePercent > 0;
  const isDown = material.changePercent < 0;
  const catColor = CATEGORY_COLORS[material.category] || CATEGORY_COLORS['Building Materials'];
  const sparkData = material.priceHistory ? material.priceHistory.slice(-14) : [];

  const priceStr = material.currentPrice >= 1000
    ? material.currentPrice.toLocaleString('en-AE', { maximumFractionDigits: 0 })
    : material.currentPrice.toFixed(2);

  return (
    <>
      <div
        className={`card p-4 cursor-pointer hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5 ${flashClass}`}
        onClick={() => setShowChart(true)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{material.icon}</span>
              <span
                className={`badge ${catColor.bg} ${catColor.text} border ${catColor.border}`}
              >
                {material.category}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 leading-tight">{material.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{material.unit}</p>
          </div>
          <ChevronRight size={14} className="text-slate-600 mt-1 flex-shrink-0" />
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {priceStr}
              <span className="text-sm font-normal text-slate-400 ml-1">AED</span>
            </div>
            <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
              {isUp ? <TrendingUp size={13} /> : isDown ? <TrendingDown size={13} /> : <Minus size={13} />}
              <span>
                {isUp ? '+' : ''}{material.changeAmount?.toFixed(2)} ({isUp ? '+' : ''}{material.changePercent?.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isUp ? '#10b981' : isDown ? '#ef4444' : '#64748b'}
                  strokeWidth={1.5}
                  dot={false}
                />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200">
                        {payload[0].value?.toFixed(2)} AED
                      </div>
                    ) : null
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {forecast && (
          <div className={`mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-1.5 text-xs ${
            forecast.trend === 'bullish' ? 'text-emerald-400' :
            forecast.trend === 'bearish' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {forecast.trend === 'bullish' ? <TrendingUp size={11} /> :
             forecast.trend === 'bearish' ? <TrendingDown size={11} /> : <Minus size={11} />}
            <span>7-day forecast: {forecast.sevenDayChange > 0 ? '+' : ''}{forecast.sevenDayChange}%</span>
            <span className="ml-auto text-slate-600 capitalize">{forecast.trend}</span>
          </div>
        )}
      </div>

      {showChart && (
        <PriceChart
          material={material}
          forecast={forecast}
          onClose={() => setShowChart(false)}
        />
      )}
    </>
  );
}
