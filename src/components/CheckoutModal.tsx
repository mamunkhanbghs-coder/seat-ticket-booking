import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Clock, CheckCircle, AlertTriangle, RefreshCw, Smartphone, Key } from 'lucide-react';
import { SeatItem, BookingEvent } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldSeats: SeatItem[];
  event: BookingEvent;
  remainingSeconds: number;
  onConfirmPayment: (paymentData: {
    paymentId: string;
    provider: string;
    idempotencyKey: string;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  heldSeats,
  event,
  remainingSeconds,
  onConfirmPayment,
}) => {
  if (!isOpen) return null;

  const [provider, setProvider] = useState<string>('mock_card');
  const [email, setEmail] = useState<string>('attendee@example.com');
  const [name, setName] = useState<string>('Mamun Khan');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `idem_${Math.random().toString(36).substring(2, 12)}`);
  const [duplicateSubmissionCount, setDuplicateSubmissionCount] = useState<number>(0);

  const totalAmount = heldSeats.reduce(
    (acc, seat) => acc + (seat.lockedPrice || seat.currentPrice),
    0
  );

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleSubmitPayment = (isDuplicateTest = false) => {
    if (remainingSeconds <= 0) {
      setErrorMessage('Your 5-minute seat hold has expired! Please select your seats again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsProcessing(false);

      if (simulateFailure) {
        setErrorMessage('Simulated Card Decline / Insufficient Funds. Seats remain held until hold timer expires.');
        return;
      }

      if (isDuplicateTest) {
        setDuplicateSubmissionCount((prev) => prev + 1);
        setErrorMessage(`Idempotency Protection Activated! Duplicate request with key [${idempotencyKey}] detected. Backend verified existing transaction without re-charging or duplicate seat creation.`);
        return;
      }

      // Successful payment
      onConfirmPayment({
        paymentId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        provider,
        idempotencyKey,
      });
    }, 800);
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        id="checkout-modal-content"
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <CreditCard className="w-5 h-5 text-[#3A86FF]" />
            <h3 className="text-lg font-bold text-slate-900">Payment Agnostic Checkout</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Hold Timer Alert */}
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center space-x-2 font-medium">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Seat Hold Expiration Window:</span>
            </span>
            <span className="font-mono font-bold text-sm bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              {timeFormatted}
            </span>
          </div>

          {/* Booking Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
              Reserved Seats ({heldSeats.length})
            </div>
            <div className="space-y-2">
              {heldSeats.map((seat) => (
                <div key={seat.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold bg-blue-50 px-2 py-0.5 rounded text-blue-700 border border-blue-200">
                      {seat.row}{seat.number}
                    </span>
                    <span className="text-slate-600">{seat.category}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ${(seat.lockedPrice || seat.currentPrice).toFixed(2)} (Locked)
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">Total Charged</span>
              <span className="text-xl font-black text-emerald-700 font-mono">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Passenger / Attendee Name</label>
              <input
                id="input-attendee-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Email for Digital Ticket</label>
              <input
                id="input-attendee-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Payment Provider Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Select Payment Provider Interface:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'mock_card', name: 'Mock Card', sub: 'Instant Sandbox', icon: CreditCard },
                { id: 'bkash', name: 'bKash / Nagad', sub: 'Mobile MFS', icon: Smartphone },
                { id: 'stripe', name: 'Stripe Gateway', sub: 'Agnostic Token', icon: ShieldCheck },
              ].map((prov) => {
                const Icon = prov.icon;
                const isSelected = provider === prov.id;
                return (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setProvider(prov.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1 text-[#3A86FF]" />
                    <div className="text-xs font-bold">{prov.name}</div>
                    <div className="text-[10px] text-slate-500">{prov.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Concurrency & Idempotency Testing Controls */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5 font-mono">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Idempotency Key: {idempotencyKey.slice(0, 14)}...</span>
              </span>
              <button
                type="button"
                onClick={() => setIdempotencyKey(`idem_${Math.random().toString(36).substring(2, 12)}`)}
                className="text-[10px] text-[#3A86FF] font-semibold hover:underline"
              >
                Regenerate
              </button>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                id="checkbox-simulate-failure"
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="accent-rose-500 rounded"
              />
              <label htmlFor="checkbox-simulate-failure" className="text-slate-600 text-xs cursor-pointer">
                Simulate Payment Failure (Verify seat remains held until expiration)
              </label>
            </div>
          </div>

          {/* Error / Alert Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-test-idempotency"
            type="button"
            disabled={isProcessing}
            onClick={() => handleSubmitPayment(true)}
            className="w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center gap-1.5 shadow-2xs"
            title="Simulate network retry or duplicate webhook with same idempotency key"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Test Duplicate Webhook ({duplicateSubmissionCount})</span>
          </button>

          <button
            id="btn-confirm-payment"
            type="button"
            disabled={isProcessing || heldSeats.length === 0}
            onClick={() => handleSubmitPayment(false)}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm ${
              isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-wait'
                : 'bg-[#00B894] hover:bg-[#00a383] text-white shadow-emerald-500/25 hover:scale-[1.02]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Verification...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Pay ${totalAmount.toFixed(2)} &amp; Book</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
