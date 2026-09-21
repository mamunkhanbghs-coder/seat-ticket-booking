import React from 'react';
import { Ticket, Calendar, Clock, MapPin, QrCode, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { ConfirmedBooking, SeatItem } from '../types';

interface UserDashboardProps {
  bookings: ConfirmedBooking[];
  heldSeats: SeatItem[];
  remainingSeconds: number;
  onViewTicket: (booking: ConfirmedBooking) => void;
  onProceedCheckout: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  bookings,
  heldSeats,
  remainingSeconds,
  onViewTicket,
  onProceedCheckout,
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div id="user-dashboard-container" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-2xl font-black text-slate-900">Customer Booking Portal</h2>
        <p className="text-sm text-slate-600 mt-1">
          Review your verified digital QR tickets, manage active 5-minute seat reservations, and view booking history.
        </p>
      </div>

      {/* Active Seat Holds (if any) */}
      {heldSeats.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Active 5-Minute Seat Hold</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                You have {heldSeats.length} seat(s) temporarily held
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Seats: {heldSeats.map((s) => `${s.row}${s.number}`).join(', ')} • Price is locked at ${heldSeats.reduce((a, b) => a + (b.lockedPrice || b.currentPrice), 0).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Remaining</span>
                <span className="font-mono text-xl font-black text-amber-800">{timeFormatted}</span>
              </div>
              <button
                id="btn-user-proceed-checkout"
                onClick={onProceedCheckout}
                className="px-4 py-2 rounded-xl bg-[#00B894] hover:bg-[#00a383] text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs shadow-emerald-500/20"
              >
                <span>Checkout Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-[#3A86FF]" />
          <span>My Verified Digital Tickets ({bookings.length})</span>
        </h3>

        {bookings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Ticket className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <div className="text-slate-600 text-sm font-semibold">No confirmed tickets yet</div>
            <p className="text-xs text-slate-500 mt-1">
              Select seats on the Seat Map and complete checkout to generate your QR ticket.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {b.reference}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Confirmed &amp; Paid
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base">{b.eventTitle}</h4>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.eventDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.venueOrRoute}
                    </span>
                    <span>
                      Seats:{' '}
                      <strong className="text-slate-900 font-mono">
                        {b.seats.map((s) => s.code).join(', ')}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Paid Amount</span>
                    <span className="font-mono font-bold text-slate-900 text-base">
                      ${b.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    id={`btn-view-ticket-${b.reference}`}
                    onClick={() => onViewTicket(b)}
                    className="px-4 py-2 rounded-xl bg-[#3A86FF] hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs shadow-blue-500/20 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View QR Ticket</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
