import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, Calendar, MapPin, User, Ticket, Download, Printer, ShieldCheck } from 'lucide-react';
import { ConfirmedBooking } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: ConfirmedBooking | null;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const [isVerified, setIsVerified] = useState<boolean>(false);

  if (!isOpen || !booking) return null;

  return (
    <div
      id="ticket-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        id="ticket-modal-content"
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-2 border border-white/20">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Booking Confirmed!</h3>
          <p className="text-xs text-blue-100 font-mono mt-1">
            Ref: <span className="font-bold text-white">{booking.reference}</span>
          </p>
        </div>

        {/* Ticket Details Body */}
        <div className="p-6 space-y-6">
          {/* Event Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-base leading-snug">
              {booking.eventTitle}
            </h4>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#3A86FF]" />
                <span>{booking.eventDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#3A86FF]" />
                <span>{booking.venueOrRoute}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-[#3A86FF]" />
                <span>Passenger / Attendee: {booking.userEmail}</span>
              </div>
            </div>
          </div>

          {/* Seats & QR Code Section */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-950 p-4 rounded-2xl shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Confirmed Seats ({booking.seats.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {booking.seats.map((seat) => (
                  <span
                    key={seat.id}
                    className="px-2.5 py-1 bg-slate-900 text-white rounded-lg font-mono font-black text-sm shadow-xs"
                  >
                    {seat.code}
                  </span>
                ))}
              </div>
              <div className="text-xs font-bold text-slate-800 pt-1">
                Total Paid: ${booking.totalAmount.toFixed(2)}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Status: PERMANENTLY BOOKED</span>
              </div>
            </div>

            {/* High-Contrast SVG QR Code Representation */}
            <div className="p-2 bg-white rounded-xl border border-slate-200 flex flex-col items-center shadow-xs">
              <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                {/* QR corner 1 */}
                <rect x="10" y="10" width="25" height="25" fill="#0F172A" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="#0F172A" />
                {/* QR corner 2 */}
                <rect x="65" y="10" width="25" height="25" fill="#0F172A" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="#0F172A" />
                {/* QR corner 3 */}
                <rect x="10" y="65" width="25" height="25" fill="#0F172A" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="#0F172A" />
                {/* Pattern dots */}
                <rect x="42" y="15" width="6" height="6" fill="#0F172A" />
                <rect x="52" y="25" width="6" height="6" fill="#0F172A" />
                <rect x="42" y="35" width="6" height="6" fill="#0F172A" />
                <rect x="25" y="45" width="6" height="6" fill="#0F172A" />
                <rect x="45" y="45" width="10" height="10" fill="#0F172A" />
                <rect x="65" y="45" width="6" height="6" fill="#0F172A" />
                <rect x="42" y="65" width="6" height="6" fill="#0F172A" />
                <rect x="65" y="70" width="8" height="8" fill="#0F172A" />
                <rect x="78" y="65" width="6" height="6" fill="#0F172A" />
                <rect x="72" y="80" width="12" height="6" fill="#0F172A" />
              </svg>
              <span className="text-[9px] font-mono font-bold text-slate-600 mt-1">SCAN AT GATE</span>
            </div>
          </div>

          {/* Verification simulator */}
          <div className="pt-2">
            <button
              id="btn-verify-ticket-staff"
              onClick={() => setIsVerified(true)}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-300 flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isVerified ? 'Ticket Verified in Database (Valid)' : 'Simulate Staff Gate Scanner'}</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-medium transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Ticket</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#3A86FF] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
