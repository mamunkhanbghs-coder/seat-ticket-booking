import React, { useState } from 'react';
import { SeatItem, BookingEvent } from '../types';
import { ShieldCheck, Info, Check, Lock, Sparkles, Bus, Music } from 'lucide-react';

interface SeatMapProps {
  event: BookingEvent;
  seats: SeatItem[];
  selectedSeatIds: number[];
  onToggleSeatSelect: (seatId: number) => void;
  onHoldSelectedSeats: () => void;
  isHolding: boolean;
  occupancyPct: number;
  currentMarkupPct: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  event,
  seats,
  selectedSeatIds,
  onToggleSeatSelect,
  onHoldSelectedSeats,
  isHolding,
  occupancyPct,
  currentMarkupPct,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const selectedTotal = selectedSeats.reduce((acc, s) => acc + s.currentPrice, 0);

  // Group seats by row
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'VIP':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'PREMIUM':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'REGULAR':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'ECONOMY':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getSeatStyle = (seat: SeatItem) => {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      return 'bg-[#3A86FF] text-white border-blue-600 shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-300 z-10';
    }

    switch (seat.status) {
      case 'BOOKED':
        return 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-75';
      case 'HELD':
        return 'bg-amber-100 text-amber-800 border-amber-400 animate-pulse cursor-not-allowed font-bold';
      case 'AVAILABLE':
      default:
        switch (seat.category) {
          case 'VIP':
            return 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100 hover:border-purple-500';
          case 'PREMIUM':
            return 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100 hover:border-blue-500';
          case 'ECONOMY':
            return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:border-slate-500';
          case 'REGULAR':
          default:
            return 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-500';
        }
    }
  };

  return (
    <div id="interactive-seat-map-container" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#3A86FF] border border-blue-200">
              {event.type === 'EVENT' ? <Music className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{event.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {event.date} • {event.time} • {event.venueOrRoute}
          </p>
        </div>

        {/* Dynamic Pricing Live Indicator */}
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Live Occupancy
            </div>
            <div className="text-sm font-bold text-slate-900">{occupancyPct.toFixed(1)}% Sold/Held</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Dynamic Tier
            </div>
            <div className="text-sm font-bold text-emerald-700">
              {currentMarkupPct > 0 ? `+${currentMarkupPct}% Surge` : 'Base Price'}
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between py-4 border-b border-slate-200 gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-700">
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-500" />
            <span className="font-medium">Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-500 animate-pulse" />
            <span className="font-medium">Held (5 Min)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300" />
            <span className="font-medium">Booked</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded bg-[#3A86FF] border border-blue-500" />
            <span className="font-medium">Selected</span>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-500 mr-2 text-[11px] uppercase font-semibold">Category:</span>
          {['ALL', 'VIP', 'PREMIUM', 'REGULAR', 'ECONOMY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                filterCategory === cat
                  ? 'bg-[#3A86FF] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Seat Layout Stage */}
      <div className="py-8 overflow-x-auto">
        {event.type === 'EVENT' ? (
          // CONCERT ARENA STAGE
          <div className="min-w-[680px] max-w-3xl mx-auto flex flex-col items-center">
            {/* Stage Bar */}
            <div className="w-3/4 h-10 mb-8 bg-gradient-to-b from-blue-100 to-slate-100 rounded-t-3xl border-t-2 border-blue-500 flex items-center justify-center text-blue-800 font-bold tracking-widest text-xs uppercase shadow-xs">
              STAGE / SCREEN
            </div>

            {/* Rows Grid */}
            <div className="space-y-3 w-full">
              {rows.map((row) => {
                const rowSeats = seats.filter((s) => s.row === row);
                return (
                  <div key={row} className="flex items-center justify-center space-x-2">
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-500">
                      {row}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {rowSeats.map((seat, sIdx) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isFiltered = filterCategory !== 'ALL' && seat.category !== filterCategory;

                        return (
                          <React.Fragment key={seat.id}>
                            {/* Visual aisle separator after 6 seats */}
                            {sIdx === 6 && <div className="w-5" />}
                            <button
                              id={`seat-${seat.row}${seat.number}`}
                              disabled={seat.status === 'BOOKED' || seat.status === 'HELD' || isHolding}
                              onClick={() => onToggleSeatSelect(seat.id)}
                              className={`w-9 h-9 rounded-lg border text-xs font-mono font-semibold flex flex-col items-center justify-center transition-all ${getSeatStyle(
                                seat
                              )} ${isFiltered ? 'opacity-20' : ''}`}
                              title={`Seat ${seat.row}${seat.number} (${seat.category}) - $${seat.currentPrice}`}
                            >
                              {seat.status === 'BOOKED' ? (
                                <Lock className="w-3 h-3 text-slate-400" />
                              ) : isSelected ? (
                                <Check className="w-3.5 h-3.5 text-white" />
                              ) : (
                                <span>{seat.number}</span>
                              )}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <span className="w-6 text-center font-mono font-bold text-xs text-slate-500">
                      {row}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // BUS COACH LAYOUT (2+2 AISLE)
          <div className="min-w-[420px] max-w-md mx-auto bg-slate-50 p-6 rounded-3xl border-2 border-slate-300 shadow-inner">
            {/* Bus Front / Steering Wheel */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 text-xs text-slate-600 font-semibold px-2">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <Bus className="w-4 h-4 text-[#3A86FF]" />
                <span>Coach Front (Door)</span>
              </span>
              <span className="px-2 py-1 bg-slate-200 rounded border border-slate-300 text-slate-700">
                Driver Cabin
              </span>
            </div>

            {/* Bus Rows */}
            <div className="space-y-3 pt-6">
              {rows.map((row) => {
                const rowSeats = seats.filter((s) => s.row === row);
                const leftPair = rowSeats.slice(0, 2);
                const rightPair = rowSeats.slice(2, 4);

                return (
                  <div key={row} className="flex items-center justify-between">
                    <span className="w-5 text-center font-mono font-bold text-xs text-slate-500">
                      {row}
                    </span>
                    {/* Left 2 seats */}
                    <div className="flex space-x-2">
                      {leftPair.map((seat) => (
                        <button
                          key={seat.id}
                          id={`seat-bus-${seat.row}${seat.number}`}
                          disabled={seat.status === 'BOOKED' || seat.status === 'HELD' || isHolding}
                          onClick={() => onToggleSeatSelect(seat.id)}
                          className={`w-10 h-10 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center transition-all ${getSeatStyle(
                            seat
                          )}`}
                          title={`Bus Seat ${seat.row}${seat.number} - $${seat.currentPrice}`}
                        >
                          {seat.status === 'BOOKED' ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            `${seat.row}${seat.number}`
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Middle Aisle */}
                    <div className="w-10 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest rotate-90">
                        Aisle
                      </span>
                    </div>

                    {/* Right 2 seats */}
                    <div className="flex space-x-2">
                      {rightPair.map((seat) => (
                        <button
                          key={seat.id}
                          id={`seat-bus-${seat.row}${seat.number}`}
                          disabled={seat.status === 'BOOKED' || seat.status === 'HELD' || isHolding}
                          onClick={() => onToggleSeatSelect(seat.id)}
                          className={`w-10 h-10 rounded-lg border text-xs font-mono font-semibold flex items-center justify-center transition-all ${getSeatStyle(
                            seat
                          )}`}
                          title={`Bus Seat ${seat.row}${seat.number} - $${seat.currentPrice}`}
                        >
                          {seat.status === 'BOOKED' ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                          ) : selectedSeatIds.includes(seat.id) ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            `${seat.row}${seat.number}`
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Seats Bottom Action Bar */}
      <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">
            Selected Seats ({selectedSeats.length}):
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {selectedSeats.length === 0 ? (
              <span className="text-sm text-slate-400 italic">Click available seats above to reserve</span>
            ) : (
              selectedSeats.map((seat) => (
                <span
                  key={seat.id}
                  className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-semibold"
                >
                  {seat.row}{seat.number} (${seat.currentPrice})
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Estimated Total</div>
            <div className="text-xl font-black text-slate-900">${selectedTotal.toFixed(2)}</div>
          </div>

          <button
            id="btn-hold-selected-seats"
            disabled={selectedSeats.length === 0 || isHolding}
            onClick={onHoldSelectedSeats}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-sm ${
              selectedSeats.length === 0 || isHolding
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#3A86FF] hover:bg-blue-600 text-white shadow-blue-500/25 hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isHolding ? 'Holding in Database...' : 'Hold Seats for 5 Min'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
