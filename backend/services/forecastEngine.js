// Holt's double exponential smoothing for trend-aware forecasting
function holtForecast(prices, horizon = 7) {
  const alpha = 0.3; // level smoothing
  const beta = 0.1;  // trend smoothing

  if (prices.length < 2) return [];

  let level = prices[0];
  let trend = prices[1] - prices[0];

  for (let i = 1; i < prices.length; i++) {
    const prevLevel = level;
    level = alpha * prices[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  const forecasts = [];
  for (let h = 1; h <= horizon; h++) {
    const point = level + h * trend;
    // Confidence interval widens with horizon
    const std = prices.reduce((acc, p, i, arr) => {
      if (i === 0) return acc;
      return acc + Math.pow(p - arr[i - 1], 2);
    }, 0) / (prices.length - 1);
    const sigma = Math.sqrt(std) * Math.sqrt(h);
    forecasts.push({
      h,
      point: parseFloat(point.toFixed(2)),
      upper: parseFloat((point + 1.96 * sigma).toFixed(2)),
      lower: parseFloat((point - 1.96 * sigma).toFixed(2)),
    });
  }
  return forecasts;
}

function generateForecasts(materials) {
  return materials.map((m) => {
    const prices = m.priceHistory.map((h) => h.price);
    const lastDate = new Date(m.priceHistory[m.priceHistory.length - 1].date);
    const raw = holtForecast(prices, 14);

    const points = raw.map((f, i) => {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i + 1);
      return {
        date: date.toISOString().split('T')[0],
        price: f.point,
        upper: f.upper,
        lower: f.lower,
        isForecast: true,
      };
    });

    // 7-day expected change
    const sevenDayChange = raw[6]
      ? parseFloat((((raw[6].point - prices[prices.length - 1]) / prices[prices.length - 1]) * 100).toFixed(2))
      : 0;

    return {
      materialId: m.id,
      forecast: points,
      sevenDayChange,
      trend: sevenDayChange > 1 ? 'bullish' : sevenDayChange < -1 ? 'bearish' : 'stable',
      generatedAt: new Date().toISOString(),
    };
  });
}

module.exports = { generateForecasts };
