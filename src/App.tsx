import React, { useState, useEffect } from 'react';
import {
  BookingEvent,
  ConfirmedBooking,
  PricingRule,
  SeatItem,
} from './types';
import {
  INITIAL_EVENTS,
  INITIAL_PRICING_RULES,
  generateEventSeats,
  generateBusSeats,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SeatMap } from './components/SeatMap';
import { HoldCountdownBanner } from './components/HoldCountdownBanner';
import { CheckoutModal } from './components/CheckoutModal';
import { TicketModal } from './components/TicketModal';
import { ConcurrencySimulator } from './components/ConcurrencySimulator';
import { DynamicPricingManager } from './components/DynamicPricingManager';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { Music, Bus, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('booking');
  const [currentEventIndex, setCurrentEventIndex] = useState<number>(0);

  // Seat matrix for Concert vs Bus
  const [eventSeats, setEventSeats] = useState<SeatItem[]>(() => generateEventSeats());
  const [busSeats, setBusSeats] = useState<SeatItem[]>(() => generateBusSeats());

  // Pricing rules
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(INITIAL_PRICING_RULES);

  // Selection & 5-minute hold states
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [heldSeatIds, setHeldSeatIds] = useState<number[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  // Bookings & Revenue
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(240.0);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isTicketOpen, setIsTicketOpen] = useState<boolean>(false);
  const [activeTicket, setActiveTicket] = useState<ConfirmedBooking | null>(null);

  // Celery state
  const [isCleaningCelery, setIsCleaningCelery] = useState<boolean>(false);

  const activeEvent = INITIAL_EVENTS[currentEventIndex];
  const currentSeats = activeEvent.type === 'EVENT' ? eventSeats : busSeats;
  const setCurrentSeats = activeEvent.type === 'EVENT' ? setEventSeats : setBusSeats;

  // Calculate real-time occupancy
  const totalSeatsCount = currentSeats.length;
  const takenSeatsCount = currentSeats.filter(
    (s) => s.status === 'BOOKED' || s.status === 'HELD'
  ).length;
  const occupancyPct = totalSeatsCount > 0 ? (takenSeatsCount / totalSeatsCount) * 100 : 0;

  // Find active dynamic pricing markup tier
  const activePricingTier = pricingRules.find(
    (r) => occupancyPct >= r.minPct && occupancyPct <= r.maxPct
  ) || pricingRules[0];
  const currentMarkupPct = activePricingTier.markupPct;

  // Recalculate dynamic prices for available seats whenever occupancy or markup changes
  useEffect(() => {
    setCurrentSeats((prev) =>
      prev.map((seat) => {
        if (seat.status === 'AVAILABLE') {
          const markupFactor = 1 + currentMarkupPct / 100;
          return {
            ...seat,
            currentPrice: Math.round(seat.basePrice * markupFactor),
          };
        }
        return seat;
      })
    );
  }, [currentMarkupPct, activeEvent.id]);

  // 5-minute countdown timer effect
  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (heldSeatIds.length > 0) {
        // Automatic lazy hold expiration: release seats back to available
        setCurrentSeats((prev) =>
          prev.map((s) => (heldSeatIds.includes(s.id) ? { ...s, status: 'AVAILABLE', heldBy: undefined, lockedPrice: undefined } : s))
        );
        setHeldSeatIds([]);
        setSelectedSeatIds([]);
      }
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingSeconds, heldSeatIds]);

  // Toggle seat selection
  const handleToggleSeatSelect = (seatId: number) => {
    setSelectedSeatIds((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  // Initiate 5-minute hold
  const handleHoldSelectedSeats = () => {
    if (selectedSeatIds.length === 0) return;
    setIsHolding(true);

    setTimeout(() => {
      // Transition to HELD and lock price
      setCurrentSeats((prev) =>
        prev.map((s) => {
          if (selectedSeatIds.includes(s.id)) {
            return {
              ...s,
              status: 'HELD',
              lockedPrice: s.currentPrice,
              heldBy: 'CurrentUser',
            };
          }
          return s;
        })
      );

      setHeldSeatIds(selectedSeatIds);
      setSelectedSeatIds([]);
      setRemainingSeconds(300); // 300 seconds = exactly 5 minutes
      setIsHolding(false);
    }, 350);
  };

  // Release all holds
  const handleReleaseAllHolds = () => {
    setCurrentSeats((prev) =>
      prev.map((s) => (heldSeatIds.includes(s.id) ? { ...s, status: 'AVAILABLE', heldBy: undefined, lockedPrice: undefined } : s))
    );
    setHeldSeatIds([]);
    setSelectedSeatIds([]);
    setRemainingSeconds(0);
  };

  // Confirm booking & payment
  const handleConfirmPayment = (paymentData: {
    paymentId: string;
    provider: string;
    idempotencyKey: string;
  }) => {
    const heldSeatsList = currentSeats.filter((s) => heldSeatIds.includes(s.id));
    const total = heldSeatsList.reduce((acc, s) => acc + (s.lockedPrice || s.currentPrice), 0);

    // Transition HELD -> BOOKED
    setCurrentSeats((prev) =>
      prev.map((s) => (heldSeatIds.includes(s.id) ? { ...s, status: 'BOOKED', heldBy: undefined } : s))
    );

    const newBooking: ConfirmedBooking = {
      id: `bk-${Date.now()}`,
      reference: `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      eventTitle: activeEvent.title,
      eventDate: `${activeEvent.date} • ${activeEvent.time}`,
      venueOrRoute: activeEvent.venueOrRoute,
      userEmail: 'attendee@example.com',
      seats: heldSeatsList.map((s) => ({
        id: s.id,
        code: `${s.row}${s.number}`,
        category: s.category,
        price: s.lockedPrice || s.currentPrice,
      })),
      totalAmount: total,
      paymentId: paymentData.paymentId,
      idempotencyKey: paymentData.idempotencyKey,
      bookedAt: Date.now(),
      qrPayload: `NEXUS-TICKET-AUTH:${paymentData.paymentId}:${activeEvent.id}`,
    };

    setBookings((prev) => [newBooking, ...prev]);
    setTotalRevenue((prev) => prev + total);
    setHeldSeatIds([]);
    setRemainingSeconds(0);
    setIsCheckoutOpen(false);

    // Show digital ticket
    setActiveTicket(newBooking);
    setIsTicketOpen(true);
  };

  // Simulated hold from concurrency test
  const handleSeatHeldSimulated = (seatId: number, winnerUser: string) => {
    setCurrentSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, status: 'HELD', heldBy: winnerUser, lockedPrice: s.currentPrice } : s))
    );
  };

  // Trigger Celery background sweeper
  const handleTriggerCeleryCleanup = () => {
    setIsCleaningCelery(true);
    setTimeout(() => {
      // Releases any expired holds
      setCurrentSeats((prev) =>
        prev.map((s) => (s.status === 'HELD' ? { ...s, status: 'AVAILABLE', heldBy: undefined, lockedPrice: undefined } : s))
      );
      setHeldSeatIds([]);
      setRemainingSeconds(0);
      setIsCleaningCelery(false);
    }, 600);
  };

  const currentlyHeldSeats = currentSeats.filter((s) => heldSeatIds.includes(s.id));

  return (
    <div id="ticket-platform-root" className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#3A86FF] selection:text-white">
      {/* Top Navbar with Active Hold Timer */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        heldCount={heldSeatIds.length}
        remainingSeconds={remainingSeconds}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Active 5-Minute Hold Notification Banner */}
        <HoldCountdownBanner
          heldSeats={currentlyHeldSeats}
          remainingSeconds={remainingSeconds}
          onCheckout={() => setIsCheckoutOpen(true)}
          onReleaseAll={handleReleaseAllHolds}
        />

        {/* Tab 1: Booking & Interactive Seat Map */}
        {activeTab === 'booking' && (
          <div className="space-y-6">
            {/* Event Switcher Bar (Concert vs Bus) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">
                  Select Experience:
                </span>
                <div className="flex space-x-1.5">
                  <button
                    id="btn-switch-concert"
                    onClick={() => {
                      setCurrentEventIndex(0);
                      setSelectedSeatIds([]);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentEventIndex === 0
                        ? 'bg-[#3A86FF] text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    <span>Concert Grand Arena (72 Seats)</span>
                  </button>

                  <button
                    id="btn-switch-bus"
                    onClick={() => {
                      setCurrentEventIndex(1);
                      setSelectedSeatIds([]);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      currentEventIndex === 1
                        ? 'bg-[#3A86FF] text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Bus className="w-4 h-4" />
                    <span>Dhaka ➔ Chattogram Bus (36 Seats)</span>
                  </button>
                </div>
              </div>

              {/* Quick shortcut to stress test */}
              <button
                id="btn-goto-concurrency-shortcut"
                onClick={() => setActiveTab('concurrency')}
                className="text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center space-x-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulate 100-User Race on this Seat Map</span>
              </button>
            </div>

            {/* Interactive Seat Map */}
            <SeatMap
              event={activeEvent}
              seats={currentSeats}
              selectedSeatIds={selectedSeatIds}
              onToggleSeatSelect={handleToggleSeatSelect}
              onHoldSelectedSeats={handleHoldSelectedSeats}
              isHolding={isHolding}
              occupancyPct={occupancyPct}
              currentMarkupPct={currentMarkupPct}
            />
          </div>
        )}

        {/* Tab 2: 100-User Concurrency Simulator */}
        {activeTab === 'concurrency' && (
          <ConcurrencySimulator
            seats={currentSeats}
            onSeatHeldSimulated={handleSeatHeldSimulated}
          />
        )}

        {/* Tab 3: Dynamic Pricing Rules Engine */}
        {activeTab === 'pricing' && (
          <DynamicPricingManager
            rules={pricingRules}
            onUpdateRules={setPricingRules}
            currentOccupancyPct={occupancyPct}
          />
        )}

        {/* Tab 4: Customer Dashboard */}
        {activeTab === 'user' && (
          <UserDashboard
            bookings={bookings}
            heldSeats={currentlyHeldSeats}
            remainingSeconds={remainingSeconds}
            onViewTicket={(b) => {
              setActiveTicket(b);
              setIsTicketOpen(true);
            }}
            onProceedCheckout={() => setIsCheckoutOpen(true)}
          />
        )}

        {/* Tab 5: Admin Console */}
        {activeTab === 'admin' && (
          <AdminDashboard
            seats={currentSeats}
            event={activeEvent}
            totalRevenue={totalRevenue}
            onTriggerCeleryCleanup={handleTriggerCeleryCleanup}
            isCleaning={isCleaningCelery}
          />
        )}

        {/* Tab 6: Django Architecture & Specifications */}
        {activeTab === 'architecture' && <ArchitectureDocs />}
      </main>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        heldSeats={currentlyHeldSeats}
        event={activeEvent}
        remainingSeconds={remainingSeconds}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Digital QR Ticket Modal */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        booking={activeTicket}
      />

      {/* Footer with mandatory attribution */}
      <Footer onNavigate={setActiveTab} />
    </div>
  );
}
