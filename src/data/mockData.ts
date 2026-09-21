import { BookingEvent, PricingRule, SeatItem } from '../types';

export const INITIAL_EVENTS: BookingEvent[] = [
  {
    id: 'evt-arena-01',
    type: 'EVENT',
    title: 'Symphony of Lights: Grand Arena World Tour 2026',
    subtitle: 'High-Traffic Concurrency Stadium Event (80 Seats Demo Matrix)',
    date: 'Saturday, October 24, 2026',
    time: '08:00 PM - 11:30 PM',
    venueOrRoute: 'Grand National Arena, Hall A',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    basePrice: 80,
    totalSeats: 72,
  },
  {
    id: 'bus-dhaka-ctg',
    type: 'BUS',
    title: 'Green Line Scania Multi-Axle VIP Coach',
    subtitle: 'Inter-City Transportation Seat Matrix (36 Seats, 2+2 Luxury)',
    date: 'Sunday, October 25, 2026',
    time: '10:30 PM Departure',
    venueOrRoute: 'Dhaka (Arambagh) ➔ Chattogram (Dampara)',
    bannerUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    basePrice: 25,
    totalSeats: 36,
  }
];

export const INITIAL_PRICING_RULES: PricingRule[] = [
  { id: 'pr-1', minPct: 0,  maxPct: 50,  markupPct: 0,  description: 'Early Bird (Base Price)' },
  { id: 'pr-2', minPct: 51, maxPct: 70,  markupPct: 10, description: 'Moderate Demand (+10%)' },
  { id: 'pr-3', minPct: 71, maxPct: 85,  markupPct: 20, description: 'High Demand (+20%)' },
  { id: 'pr-4', minPct: 86, maxPct: 95,  markupPct: 35, description: 'Surge Demand (+35%)' },
  { id: 'pr-5', minPct: 96, maxPct: 100, markupPct: 50, description: 'Final Inventory Surge (+50%)' },
];

export function generateEventSeats(): SeatItem[] {
  const seats: SeatItem[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  let idCounter = 1;

  rows.forEach((row, rIdx) => {
    let category: SeatItem['category'] = 'REGULAR';
    let basePrice = 80;

    if (rIdx === 0) {
      category = 'VIP';
      basePrice = 160;
    } else if (rIdx === 1) {
      category = 'PREMIUM';
      basePrice = 120;
    } else if (rIdx >= 4) {
      category = 'ECONOMY';
      basePrice = 55;
    }

    for (let num = 1; num <= 12; num++) {
      // Seed a few booked seats to demonstrate realistic occupancy
      let status: SeatItem['status'] = 'AVAILABLE';
      if ((row === 'A' && num === 3) || (row === 'B' && num === 8) || (row === 'C' && (num === 4 || num === 5))) {
        status = 'BOOKED';
      }

      seats.push({
        id: idCounter++,
        row,
        number: num,
        category,
        basePrice,
        currentPrice: basePrice,
        status,
      });
    }
  });

  return seats;
}

export function generateBusSeats(): SeatItem[] {
  const seats: SeatItem[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  let idCounter = 101;

  rows.forEach((row, rIdx) => {
    const category: SeatItem['category'] = rIdx < 2 ? 'PREMIUM' : 'REGULAR';
    const basePrice = rIdx < 2 ? 35 : 25;

    for (let num = 1; num <= 4; num++) {
      let status: SeatItem['status'] = 'AVAILABLE';
      if ((row === 'A' && num === 1) || (row === 'C' && num === 3) || (row === 'E' && num === 2)) {
        status = 'BOOKED';
      }

      seats.push({
        id: idCounter++,
        row,
        number: num,
        category,
        basePrice,
        currentPrice: basePrice,
        status,
      });
    }
  });

  return seats;
}
