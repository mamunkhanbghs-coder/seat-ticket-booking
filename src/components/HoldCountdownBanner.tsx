import React from 'react';
import { Clock, ShieldAlert, ArrowRight, XCircle } from 'lucide-react';
import { SeatItem } from '../types';

interface HoldCountdownBannerProps {
  heldSeats: SeatItem[];
  remainingSeconds: number;
  onCheckout: () => void;
  onReleaseAll: () => void;
}

export const HoldCountdownBanner: React.FC<HoldCountdownBannerProps> = ({
  heldSeats,
  remainingSeconds,
  onCheckout,
  onReleaseAll,
}) => {
  if (heldSeats.length === 0) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const totalLocked = heldSeats.reduce((acc, s) => acc + (s.lockedPrice || s.currentPrice), 0);

  const isUrgent = remainingSeconds < 60;

  return (
    <div
      id="hold-countdown-banner"
      className={`mb-6 p-4 rounded-xl border transition-all duration-300 shadow-xs ${
        isUrgent
          ? 'bg-rose-50 border-rose-300 text-rose-900'
          : 'bg-amber-50 border-amber-300 text-amber-900'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Timer info */}
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-xl border ${
              isUrgent
                ? 'bg-rose-100 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-amber-100 border-amber-300 text-amber-800'
            }`}
          >
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-slate-900">
                5-Minute Seat Hold Active
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {timeFormatted} remaining
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Held: {heldSeats.map((s) => `${s.row}${s.number}`).join(', ')} • Locked Price Guaranteed: ${totalLocked.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-end">
          <button
            id="btn-release-hold-banner"
            onClick={onReleaseAll}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 transition-colors border border-slate-300 shadow-xs"
          >
            <XCircle className="w-4 h-4 text-slate-500" />
            <span>Release Seats</span>
          </button>
          <button
            id="btn-checkout-hold-banner"
            onClick={onCheckout}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#00B894] hover:bg-[#00a383] text-white transition-colors shadow-xs shadow-emerald-500/20"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
