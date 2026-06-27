const { generateForecasts } = require('./forecastEngine');

class PriceEngine {
  constructor(materials, io) {
    this.materials = materials;
    this.io = io;
    this.interval = null;
    this.forecastInterval = null;
    this.forecasts = generateForecasts(materials);
  }

  start() {
    // Price updates every 30 seconds
    this.interval = setInterval(() => this.tick(), 30000);
    // Forecast updates every 5 minutes
    this.forecastInterval = setInterval(() => this.updateForecasts(), 300000);
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    if (this.forecastInterval) clearInterval(this.forecastInterval);
  }

  tick() {
    const updates = [];

    this.materials.forEach((m) => {
      const prevPrice = m.currentPrice;

      // Random walk with momentum
      const noise = (Math.random() - 0.48) * 0.018;
      const momentumDecay = 0.85;
      m.momentum = m.momentum * momentumDecay + noise;

      // Occasional larger market event (5% chance)
      const shock = Math.random() < 0.05 ? (Math.random() - 0.5) * 0.04 : 0;

      const newPrice = Math.max(
        m.basePrice * 0.7,
        Math.min(m.basePrice * 1.5, prevPrice * (1 + m.momentum + shock))
      );

      m.previousPrice = prevPrice;
      m.currentPrice = parseFloat(newPrice.toFixed(2));
      m.changeAmount = parseFloat((m.currentPrice - m.previousPrice).toFixed(2));
      m.changePercent = parseFloat(((m.changeAmount / m.previousPrice) * 100).toFixed(2));
      m.lastUpdated = new Date().toISOString();

      const todayStr = new Date().toISOString().split('T')[0];
      const lastEntry = m.priceHistory[m.priceHistory.length - 1];
      if (lastEntry.date === todayStr) {
        lastEntry.price = m.currentPrice;
      } else {
        m.priceHistory.push({ date: todayStr, price: m.currentPrice });
        if (m.priceHistory.length > 90) m.priceHistory.shift();
      }

      updates.push({
        id: m.id,
        currentPrice: m.currentPrice,
        previousPrice: m.previousPrice,
        changeAmount: m.changeAmount,
        changePercent: m.changePercent,
        lastUpdated: m.lastUpdated,
      });
    });

    this.io.emit('price_update', {
      updates,
      timestamp: new Date().toISOString(),
    });
  }

  updateForecasts() {
    this.forecasts = generateForecasts(this.materials);
    this.io.emit('forecast_update', {
      forecasts: this.forecasts,
      timestamp: new Date().toISOString(),
    });
  }

  getMaterials() {
    return this.materials;
  }

  getForecasts() {
    return this.forecasts;
  }

  getMaterialById(id) {
    return this.materials.find((m) => m.id === id);
  }

  getSummary() {
    const sorted = [...this.materials].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sorted.slice(0, 3).filter((m) => m.changePercent > 0);
    const losers = sorted.slice(-3).reverse().filter((m) => m.changePercent < 0);
    const avgChange = this.materials.reduce((s, m) => s + m.changePercent, 0) / this.materials.length;
    return {
      topGainers: gainers,
      topLosers: losers,
      averageChange: parseFloat(avgChange.toFixed(2)),
      totalMaterials: this.materials.length,
      marketTrend: avgChange > 0.5 ? 'bullish' : avgChange < -0.5 ? 'bearish' : 'neutral',
      lastUpdated: new Date().toISOString(),
    };
  }
}

module.exports = PriceEngine;
