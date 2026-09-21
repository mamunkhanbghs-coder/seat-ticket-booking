import React, { useState } from 'react';
import { TrendingUp, Settings, Sliders, DollarSign, Check, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { PricingRule } from '../types';

interface DynamicPricingManagerProps {
  rules: PricingRule[];
  onUpdateRules: (newRules: PricingRule[]) => void;
  currentOccupancyPct: number;
}

export const DynamicPricingManager: React.FC<DynamicPricingManagerProps> = ({
  rules,
  onUpdateRules,
  currentOccupancyPct,
}) => {
  const [localRules, setLocalRules] = useState<PricingRule[]>(rules);
  const [simulatedOccupancy, setSimulatedOccupancy] = useState<number>(Math.round(currentOccupancyPct));
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleMarkupChange = (id: string, newMarkup: number) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, markupPct: Math.max(0, newMarkup) } : r))
    );
    setIsSaved(false);
  };

  const handleSave = () => {
    onUpdateRules(localRules);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Determine active tier based on simulated occupancy
  const activeTier = localRules.find(
    (r) => simulatedOccupancy >= r.minPct && simulatedOccupancy <= r.maxPct
  ) || localRules[0];

  // Base sample prices
  const sampleBase = 80;
  const categories = [
    { name: 'VIP', mult: 2.0, base: 160 },
    { name: 'PREMIUM', mult: 1.5, base: 120 },
    { name: 'REGULAR', mult: 1.0, base: 80 },
    { name: 'ECONOMY', mult: 0.85, base: 55 },
  ];

  return (
    <div id="dynamic-pricing-manager-container" className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#3A86FF] font-bold text-xs uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Configurable Dynamic Pricing Engine</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Dynamic Pricing Rules &amp; Price Lock</h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Ticket prices dynamically surge as seat inventory diminishes. When a customer initiates
              a 5-minute hold, their price is <strong>locked</strong>, preventing checkout price jumps.
            </p>
          </div>

          <button
            id="btn-save-pricing-rules"
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all ${
              isSaved
                ? 'bg-[#00B894] text-white shadow-xs shadow-emerald-500/20'
                : 'bg-[#3A86FF] hover:bg-blue-600 text-white shadow-xs shadow-blue-500/20'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Rules Saved &amp; Applied!</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                <span>Save Pricing Rules</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tier Rules Editor */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#3A86FF]" />
            <span>Inventory Occupancy Thresholds</span>
          </h3>

          <div className="space-y-3">
            {localRules.map((rule) => {
              const isActive = activeTier.id === rule.id;
              return (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                          isActive
                            ? 'bg-[#3A86FF] text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {rule.markupPct}%
                      </span>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                          <span>{rule.description}</span>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Active Tier
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          Range: {rule.minPct}% — {rule.maxPct}% Occupancy
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="text-xs text-slate-600 font-medium">Markup:</label>
                      <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
                        <input
                          id={`input-markup-${rule.id}`}
                          type="number"
                          min="0"
                          max="200"
                          value={rule.markupPct}
                          onChange={(e) => handleMarkupChange(rule.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-transparent text-center font-mono font-bold text-sm text-slate-900 focus:outline-none"
                        />
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-mono font-bold">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Live Interactive Calculator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Live Price Simulation</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Drag the occupancy slider to observe how ticket prices adjust across categories in real time.
            </p>

            {/* Occupancy Slider */}
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-600 font-medium">Simulated Occupancy</span>
                <span className="font-mono text-sm font-black text-amber-700">
                  {simulatedOccupancy}%
                </span>
              </div>
              <input
                id="slider-simulated-occupancy"
                type="range"
                min="0"
                max="100"
                value={simulatedOccupancy}
                onChange={(e) => setSimulatedOccupancy(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0% (Empty)</span>
                <span>50%</span>
                <span>100% (Sold Out)</span>
              </div>
            </div>

            {/* Category Price Preview Table */}
            <div className="space-y-2 text-xs">
              {categories.map((cat) => {
                const finalPrice = cat.base * (1 + activeTier.markupPct / 100);
                return (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="text-slate-500 ml-2 font-mono text-[11px]">
                        Base: ${cat.base}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-emerald-700">
                        ${finalPrice.toFixed(2)}
                      </span>
                      {activeTier.markupPct > 0 && (
                        <span className="text-[10px] text-amber-700 block font-mono">
                          +{activeTier.markupPct}% surge
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Lock Guarantee Note */}
          <div className="mt-6 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start space-x-2.5 text-xs text-blue-900">
            <Lock className="w-4 h-4 text-[#3A86FF] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Price Lock Rule:</strong> Once a user selects and holds a seat, that seat's price
              is frozen in <code className="text-blue-700 bg-blue-100 px-1 py-0.2 rounded">SeatHold.locked_price</code> for 5 minutes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
