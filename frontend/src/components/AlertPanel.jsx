import { useState, useEffect } from 'react';
import { Bell, BellRing, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'uae_price_alerts';

function loadAlerts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAlerts(alerts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export default function AlertPanel({ materials }) {
  const [alerts, setAlerts] = useState(loadAlerts);
  const [triggered, setTriggered] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ materialId: '', condition: 'above', threshold: '' });

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  // Check alerts against live prices
  useEffect(() => {
    if (!materials?.length) return;
    const newTriggered = [];
    alerts.forEach((alert) => {
      const m = materials.find((x) => x.id === alert.materialId);
      if (!m) return;
      const hit = alert.condition === 'above'
        ? m.currentPrice >= parseFloat(alert.threshold)
        : m.currentPrice <= parseFloat(alert.threshold);
      if (hit) {
        newTriggered.push({ ...alert, currentPrice: m.currentPrice, materialName: m.name, icon: m.icon });
      }
    });
    setTriggered(newTriggered);
  }, [materials, alerts]);

  function addAlert() {
    if (!form.materialId || !form.threshold) return;
    const m = materials.find((x) => x.id === form.materialId);
    const alert = {
      id: Date.now().toString(),
      materialId: form.materialId,
      materialName: m?.name || form.materialId,
      icon: m?.icon || '📦',
      condition: form.condition,
      threshold: parseFloat(form.threshold),
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [alert, ...prev]);
    setForm({ materialId: '', condition: 'above', threshold: '' });
    setShowForm(false);
  }

  function removeAlert(id) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Triggered alerts */}
      {triggered.length > 0 && (
        <div className="card p-5 border-amber-500/40 bg-amber-500/5">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-3">
            <BellRing size={14} className="animate-bounce" /> {triggered.length} Alert{triggered.length !== 1 ? 's' : ''} Triggered
          </h3>
          <div className="space-y-2">
            {triggered.map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                  <span className="text-sm text-slate-200">
                    <span className="mr-1">{t.icon}</span>
                    <span className="font-medium">{t.materialName}</span> is{' '}
                    {t.condition === 'above' ? 'above' : 'below'}{' '}
                    <span className="text-amber-300 font-semibold">{t.threshold} AED</span>
                    {' '}(now {t.currentPrice?.toFixed(2)} AED)
                  </span>
                </div>
                <CheckCircle size={14} className="text-amber-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add alert form */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Bell size={14} /> Price Alerts
          </h3>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={12} /> New Alert
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Material</label>
                <select
                  value={form.materialId}
                  onChange={(e) => setForm((f) => ({ ...f, materialId: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select material...</option>
                  {(materials || []).map((m) => (
                    <option key={m.id} value={m.id}>{m.icon} {m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="above">Price goes above</option>
                  <option value="below">Price goes below</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Threshold (AED)</label>
                <input
                  type="number"
                  value={form.threshold}
                  onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
                  placeholder="e.g. 3000"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addAlert}
                className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Alert
              </button>
            </div>
          </div>
        )}

        {alerts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No alerts configured</p>
            <p className="text-xs mt-1">Create alerts to get notified when prices cross thresholds</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => {
              const isTriggered = triggered.some((t) => t.id === alert.id);
              const m = materials?.find((x) => x.id === alert.materialId);
              return (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between border rounded-lg px-3 py-2.5 ${
                    isTriggered
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-slate-700 bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{alert.icon}</span>
                    <div>
                      <p className="text-sm text-slate-200">
                        <span className="font-medium">{alert.materialName}</span>{' '}
                        <span className="text-slate-400">
                          {alert.condition === 'above' ? '>' : '<'}{' '}
                        </span>
                        <span className="text-blue-300 font-semibold">{alert.threshold} AED</span>
                      </p>
                      {m && (
                        <p className="text-xs text-slate-500">
                          Current: {m.currentPrice?.toFixed(2)} AED
                          {isTriggered && <span className="text-amber-400 ml-2 font-medium">● Triggered</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors rounded"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-4">
        <p className="text-xs text-slate-500">
          <span className="text-slate-400 font-medium">Note:</span> Alerts are stored in your browser's local storage and are checked against live prices every 30 seconds. Browser notifications are not yet configured — check this panel regularly.
        </p>
      </div>
    </div>
  );
}
