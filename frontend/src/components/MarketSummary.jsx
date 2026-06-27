import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

function MoverRow({ material, rank }) {
  const isUp = material.changePercent > 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-700/50 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-slate-600 text-xs w-4 font-mono">{rank}</span>
        <span className="text-lg">{material.icon}</span>
        <div>
          <p className="text-sm font-medium text-slate-200">{material.name}</p>
          <p className="text-xs text-slate-500">{material.unit}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-100">
          {material.currentPrice >= 1000
            ? material.currentPrice.toLocaleString('en-AE', { maximumFractionDigits: 0 })
            : material.currentPrice.toFixed(2)} AED
        </p>
        <p className={`text-xs font-medium flex items-center justify-end gap-0.5 ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {isUp ? '+' : ''}{material.changePercent?.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

export default function MarketSummary({ summary, materials }) {
  if (!summary || !materials?.length) {
    return (
      <div className="card p-6 text-center text-slate-500">
        <Activity size={32} className="mx-auto mb-3 opacity-30" />
        <p>Loading market data...</p>
      </div>
    );
  }

  const sorted = [...materials].sort((a, b) => b.changePercent - a.changePercent);
  const gainers = sorted.filter((m) => m.changePercent > 0).slice(0, 5);
  const losers = sorted.filter((m) => m.changePercent < 0).slice(-5).reverse();

  const trendColor = summary.marketTrend === 'bullish'
    ? 'text-emerald-400' : summary.marketTrend === 'bearish'
    ? 'text-red-400' : 'text-slate-400';
  const TrendIcon = summary.marketTrend === 'bullish' ? TrendingUp
    : summary.marketTrend === 'bearish' ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      {/* Market overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Market Trend</p>
          <div className={`flex items-center justify-center gap-2 text-2xl font-bold capitalize ${trendColor}`}>
            <TrendIcon size={22} />
            {summary.marketTrend}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Avg change: {summary.averageChange > 0 ? '+' : ''}{summary.averageChange?.toFixed(2)}%
          </p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Materials Tracked</p>
          <p className="text-3xl font-bold text-white">{summary.totalMaterials}</p>
          <p className="text-xs text-slate-500 mt-1">UAE Construction Market</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Update Frequency</p>
          <p className="text-2xl font-bold text-blue-400">30s</p>
          <p className="text-xs text-slate-500 mt-1">Live price simulation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-3">
            <TrendingUp size={14} /> Top Gainers Today
          </h3>
          {gainers.length === 0 ? (
            <p className="text-slate-500 text-sm">No gainers at this time</p>
          ) : (
            gainers.map((m, i) => <MoverRow key={m.id} material={m} rank={i + 1} />)
          )}
        </div>

        {/* Top Losers */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-3">
            <TrendingDown size={14} /> Top Losers Today
          </h3>
          {losers.length === 0 ? (
            <p className="text-slate-500 text-sm">No losers at this time</p>
          ) : (
            losers.map((m, i) => <MoverRow key={m.id} material={m} rank={i + 1} />)
          )}
        </div>
      </div>

      {/* All materials sorted table */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">All Materials — Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-700">
                <th className="text-left pb-2 font-medium">Material</th>
                <th className="text-right pb-2 font-medium">Price (AED)</th>
                <th className="text-right pb-2 font-medium">Change</th>
                <th className="text-right pb-2 font-medium">Change %</th>
                <th className="text-left pb-2 font-medium pl-4">Category</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => {
                const isUp = m.changePercent > 0;
                const isDown = m.changePercent < 0;
                return (
                  <tr key={m.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="py-2.5 flex items-center gap-2">
                      <span>{m.icon}</span>
                      <span className="text-slate-200 font-medium">{m.name}</span>
                    </td>
                    <td className="text-right text-slate-100 font-mono">
                      {m.currentPrice >= 1000
                        ? m.currentPrice.toLocaleString('en-AE', { maximumFractionDigits: 0 })
                        : m.currentPrice.toFixed(2)}
                    </td>
                    <td className={`text-right font-mono ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
                      {isUp ? '+' : ''}{m.changeAmount?.toFixed(2)}
                    </td>
                    <td className={`text-right font-mono font-medium ${isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-slate-400'}`}>
                      {isUp ? '+' : ''}{m.changePercent?.toFixed(2)}%
                    </td>
                    <td className="pl-4 text-slate-500 text-xs">{m.category}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
