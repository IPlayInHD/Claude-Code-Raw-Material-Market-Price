function generateHistory(basePrice, days = 30) {
  const history = [];
  let price = basePrice * (0.92 + Math.random() * 0.08);
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.48) * 0.025;
    price = price * (1 + change);
    history.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }
  return history;
}

const MATERIALS = [
  {
    id: 'steel-rebar',
    name: 'Steel Rebar',
    category: 'Metals',
    unit: 'per tonne',
    basePrice: 2800,
    description: 'Deformed steel bars for concrete reinforcement',
    icon: '🔩',
  },
  {
    id: 'structural-steel',
    name: 'Structural Steel',
    category: 'Metals',
    unit: 'per tonne',
    basePrice: 3200,
    description: 'I-beams, channels, and angles for structural use',
    icon: '🏗️',
  },
  {
    id: 'copper-wire',
    name: 'Copper Wire',
    category: 'Metals',
    unit: 'per kg',
    basePrice: 38,
    description: 'Electrical-grade copper conductor wire',
    icon: '⚡',
  },
  {
    id: 'aluminum-sheets',
    name: 'Aluminum Sheets',
    category: 'Metals',
    unit: 'per kg',
    basePrice: 22,
    description: 'Flat-rolled aluminum sheets for cladding',
    icon: '🔲',
  },
  {
    id: 'ready-mix-concrete',
    name: 'Ready-Mix Concrete',
    category: 'Aggregates',
    unit: 'per m³',
    basePrice: 320,
    description: 'Standard C25/30 ready-mix concrete',
    icon: '🏛️',
  },
  {
    id: 'portland-cement',
    name: 'Portland Cement',
    category: 'Aggregates',
    unit: 'per 50kg bag',
    basePrice: 18,
    description: 'OPC Grade 42.5 Portland cement',
    icon: '🧱',
  },
  {
    id: 'washed-sand',
    name: 'Washed Sand',
    category: 'Aggregates',
    unit: 'per tonne',
    basePrice: 85,
    description: 'Fine washed sand for construction use',
    icon: '🏜️',
  },
  {
    id: 'coarse-aggregate',
    name: 'Coarse Aggregate',
    category: 'Aggregates',
    unit: 'per tonne',
    basePrice: 95,
    description: 'Crushed stone aggregate 10-20mm',
    icon: '🪨',
  },
  {
    id: 'hollow-blocks',
    name: 'Hollow Concrete Blocks',
    category: 'Building Materials',
    unit: 'per piece',
    basePrice: 3.5,
    description: 'Standard 400x200x200mm hollow blocks',
    icon: '🧱',
  },
  {
    id: 'ceramic-tiles',
    name: 'Ceramic Tiles',
    category: 'Building Materials',
    unit: 'per m²',
    basePrice: 65,
    description: 'Standard floor/wall ceramic tiles',
    icon: '🔷',
  },
  {
    id: 'gypsum-board',
    name: 'Gypsum Board',
    category: 'Building Materials',
    unit: 'per sheet',
    basePrice: 45,
    description: '12mm standard gypsum drywall sheets',
    icon: '📋',
  },
  {
    id: 'plywood',
    name: 'Plywood Sheets',
    category: 'Building Materials',
    unit: 'per sheet',
    basePrice: 95,
    description: '18mm marine-grade plywood 2440x1220mm',
    icon: '🪵',
  },
  {
    id: 'hdpe-pipes',
    name: 'HDPE Pipes',
    category: 'Pipes & Insulation',
    unit: 'per metre',
    basePrice: 28,
    description: 'High-density polyethylene pipes 110mm',
    icon: '🔵',
  },
  {
    id: 'insulation',
    name: 'Thermal Insulation',
    category: 'Pipes & Insulation',
    unit: 'per m²',
    basePrice: 35,
    description: '50mm rockwool thermal insulation boards',
    icon: '🌡️',
  },
  {
    id: 'bitumen',
    name: 'Bitumen',
    category: 'Aggregates',
    unit: 'per tonne',
    basePrice: 1200,
    description: 'Grade 60/70 penetration bitumen',
    icon: '🛣️',
  },
];

function initializeMaterials() {
  return MATERIALS.map((m) => {
    const history = generateHistory(m.basePrice);
    const currentPrice = history[history.length - 1].price;
    const prevPrice = history[history.length - 2].price;
    return {
      ...m,
      currentPrice,
      previousPrice: prevPrice,
      priceHistory: history,
      currency: 'AED',
      market: 'UAE',
      lastUpdated: new Date().toISOString(),
      changePercent: parseFloat((((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2)),
      changeAmount: parseFloat((currentPrice - prevPrice).toFixed(2)),
      momentum: 0,
    };
  });
}

module.exports = { initializeMaterials };
