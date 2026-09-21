export type SeatCategory = 'VIP' | 'PREMIUM' | 'REGULAR' | 'ECONOMY';

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'SELECTED';

export interface SeatItem {
  id: number;
  row: string;
  number: number;
  category: SeatCategory;
  basePrice: number;
  currentPrice: number;
  status: SeatStatus;
  heldBy?: string;
  heldUntil?: number; // timestamp in ms
  lockedPrice?: number;
}

export interface BookingEvent {
  id: string;
  type: 'EVENT' | 'BUS';
  title: string;
  subtitle: string;
  date: string;
  time: string;
  venueOrRoute: string;
  bannerUrl: string;
  basePrice: number;
  totalSeats: number;
}

export interface SeatHoldRecord {
  id: string;
  seatId: number;
  seatCode: string;
  user: string;
  lockedPrice: number;
  createdAt: number;
  expiresAt: number; // timestamp in ms
}

export interface ConfirmedBooking {
  id: string;
  reference: string;
  eventTitle: string;
  eventDate: string;
  venueOrRoute: string;
  userEmail: string;
  seats: {
    id: number;
    code: string;
    category: SeatCategory;
    price: number;
  }[];
  totalAmount: number;
  paymentId: string;
  idempotencyKey: string;
  bookedAt: number;
  qrPayload: string;
}

export interface PricingRule {
  id: string;
  minPct: number;
  maxPct: number;
  markupPct: number;
  description: string;
}

export interface ConcurrencyAttemptLog {
  id: string;
  timestamp: string;
  userId: string;
  seatCode: string;
  status: 'GRANTED' | 'REJECTED_409' | 'LOCKED_WAIT';
  message: string;
  latencyMs: number;
}
