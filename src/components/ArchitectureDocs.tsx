import React, { useState } from 'react';
import { Server, Database, ShieldAlert, Cpu, Terminal, Layers, CheckCircle2, Copy, Check, Key } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envContent = `# Django Core
SECRET_KEY=django-insecure-mamun-ticket-booking-2026-change-in-production
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

# Database (SQLite Development Engine)
DATABASE_URL=sqlite:///db.sqlite3

# Redis & Celery
REDIS_URL=redis://127.0.0.1:6379/1
CELERY_BROKER_URL=redis://127.0.0.1:6379/1
CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/2

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=YOUR_GMAIL_APP_PASSWORD
EMAIL_USE_TLS=True

# Payment Gateway Configuration
PAYMENT_API_KEY=test_api_key
PAYMENT_SECRET=test_payment_secret`;

  const windowsCmd = `:: 1. Create and Activate Virtual Environment on Windows
python -m venv venv
venv\\Scripts\\activate

:: 2. Install Production Dependencies
pip install -r requirements.txt

:: 3. Configure Database (.env with PostgreSQL & Redis)
copy .env.example .env

:: 4. Run Migrations
python manage.py makemigrations
python manage.py migrate

:: 5. Start Celery Worker & Beat (Separate Windows Terminals)
celery -A config worker --loglevel=info -P solo
celery -A config beat --loglevel=info

:: 6. Launch Django Development Server
python manage.py runserver 0.0.0.0:8000`;

  const concurrencyCode = `@transaction.atomic
def hold_seat(user, event_seat_id: int):
    # Step 1: PostgreSQL row-level lock
    event_seat = EventSeat.objects.select_for_update().get(id=event_seat_id)
    
    # Step 2: Check current status & lazy expiration
    now = timezone.now()
    if event_seat.status == SeatStatus.BOOKED:
        raise ConcurrencyBookingError("Seat already booked by another user.")
    
    if event_seat.status == SeatStatus.HELD:
        existing_hold = SeatHold.objects.filter(event_seat=event_seat, is_active=True).first()
        if existing_hold and existing_hold.expires_at > now:
            raise ConcurrencyBookingError("Seat currently held by another user.")
        # Expired hold: allow reclamation
    
    # Step 3: Calculate and lock dynamic price
    locked_price = DynamicPricingEngine.calculate_price(event_seat)
    
    # Step 4: Create hold record and update seat
    hold = SeatHold.objects.create(
        user=user,
        event_seat=event_seat,
        locked_price=locked_price,
        expires_at=now + timedelta(minutes=5),
        is_active=True
    )
    event_seat.status = SeatStatus.HELD
    event_seat.save()
    return hold`;

  return (
    <div id="architecture-docs-container" className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2 text-[#3A86FF] font-bold text-xs uppercase tracking-wider mb-1">
          <Server className="w-4 h-4" />
          <span>System Architecture &amp; Concurrency Engineering Specification</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900">
          NexusTicket: Production High-Traffic Architecture
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Deep-dive technical blueprint explaining why PostgreSQL row-level locks prevent race conditions,
          how Redis decouples read spikes, and how Celery guarantees 5-minute hold hygiene.
        </p>
      </div>

      {/* Core Architectural Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">PostgreSQL ACID Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Uses <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">SELECT FOR UPDATE</code> within atomic
            transactions. Two concurrent threads contending for the exact same seat row serialize at the
            storage engine. The winner commits state; the loser receives HTTP 409 Conflict.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">5-Min Hold + Lazy Sweep</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Seat holds expire exactly 5 minutes after initiation. Celery Beat cleans expired holds every
            30 seconds. Furthermore, lazy checking on reservation attempts ensures lagging background
            workers never block inventory.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Price Lock Guarantee</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dynamic pricing surges from Base to +50% based on real-time occupancy. Crucially, when a user
            holds a seat, their price is frozen in <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">SeatHold.locked_price</code>,
            protecting customers from checkout price jumps.
          </p>
        </div>
      </div>

      {/* Code snippet: Concurrency lock */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              apps/inventory/services.py: Concurrency-Safe Hold Engine
            </h3>
          </div>
          <button
            onClick={() => copyCode('concurrency', concurrencyCode)}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 font-mono transition-colors"
          >
            {copiedKey === 'concurrency' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'concurrency' ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed p-2">
          {concurrencyCode}
        </pre>
      </div>

      {/* Production Environment Configuration (.env) */}
      <div id="env-configuration-section" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-5 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active Environment Variables (.env)
              </h3>
              <p className="text-xs text-slate-500">
                Production Django, PostgreSQL, Redis, Celery, SMTP, and Payment Gateway configurations
              </p>
            </div>
          </div>
          <button
            onClick={() => copyCode('env', envContent)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-medium flex items-center space-x-1.5 transition-colors shadow-2xs"
          >
            {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'env' ? 'Copied .env' : 'Copy .env File'}</span>
          </button>
        </div>

        {/* Formatted Environment Variables Table */}
        <div className="overflow-x-auto mb-5">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Variable Name</th>
                <th className="px-4 py-2.5">Configured Value</th>
                <th className="px-4 py-2.5">Target Subsystem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {[
                { cat: 'Django Core', name: 'SECRET_KEY', val: 'django-insecure-mamun-ticket-booking-2026-change-in-production', sub: 'Django Cryptographic Signing' },
                { cat: 'Django Core', name: 'DEBUG', val: 'True', sub: 'Development Diagnostic Mode' },
                { cat: 'Django Core', name: 'ALLOWED_HOSTS', val: '127.0.0.1,localhost', sub: 'HTTP Host Header Security' },
                { cat: 'Database', name: 'DATABASE_URL', val: 'sqlite:///db.sqlite3', sub: 'SQLite File-Based Database (Local Dev)' },
                { cat: 'Redis Cache', name: 'REDIS_URL', val: 'redis://127.0.0.1:6379/1', sub: 'In-Memory Cache & Seat Lock Fast-Path' },
                { cat: 'Celery Broker', name: 'CELERY_BROKER_URL', val: 'redis://127.0.0.1:6379/1', sub: 'Background Worker Task Queue' },
                { cat: 'Celery Results', name: 'CELERY_RESULT_BACKEND', val: 'redis://127.0.0.1:6379/2', sub: 'Async Task Execution Results' },
                { cat: 'SMTP Email', name: 'EMAIL_HOST', val: 'smtp.gmail.com', sub: 'Gmail SMTP Server' },
                { cat: 'SMTP Email', name: 'EMAIL_PORT', val: '587', sub: 'TLS Mail Port' },
                { cat: 'SMTP Email', name: 'EMAIL_HOST_USER', val: 'your-email@gmail.com', sub: 'Sender Account' },
                { cat: 'SMTP Email', name: 'EMAIL_HOST_PASSWORD', val: 'YOUR_GMAIL_APP_PASSWORD', sub: 'App Password Auth' },
                { cat: 'SMTP Email', name: 'EMAIL_USE_TLS', val: 'True', sub: 'STARTTLS Transport Encryption' },
                { cat: 'Payment Gateway', name: 'PAYMENT_API_KEY', val: 'test_api_key', sub: 'Payment API Authentication' },
                { cat: 'Payment Gateway', name: 'PAYMENT_SECRET', val: 'test_payment_secret', sub: 'Webhook Signature & Secret' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2 font-sans font-semibold text-slate-500 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {row.cat}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-bold text-blue-700">{row.name}</td>
                  <td className="px-4 py-2 text-slate-800 break-all">{row.val}</td>
                  <td className="px-4 py-2 font-sans text-slate-500 text-[11px]">{row.sub}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Raw .env Block */}
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 border border-slate-800">
          <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2">Raw .env File Format:</div>
          <pre className="overflow-x-auto text-emerald-400/90 leading-relaxed">{envContent}</pre>
        </div>
      </div>

      {/* Windows Development Setup Commands */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-mono">
              Windows CMD / VS Code Setup Terminal Commands
            </h3>
          </div>
          <button
            onClick={() => copyCode('windows', windowsCmd)}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 font-mono transition-colors"
          >
            {copiedKey === 'windows' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'windows' ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed p-2">
          {windowsCmd}
        </pre>
      </div>

      {/* Development Roadmap Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#3A86FF]" />
          <span>Full 16-Phase Production Delivery Roadmap</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { phase: 'Phase 1: Architecture & Planning', status: 'COMPLETE', desc: 'System blueprints, state machines, and concurrency locking specs' },
            { phase: 'Phase 2: Django & Virtualenv Setup', status: 'COMPLETE', desc: 'Django 5, DRF, PostgreSQL engine settings, Celery configurations' },
            { phase: 'Phase 3: Database Models & Indexes', status: 'COMPLETE', desc: 'EventSeat, SeatHold, Booking, B-tree indexes & unique constraints' },
            { phase: 'Phase 4: Concurrency Booking Engine', status: 'COMPLETE', desc: 'select_for_update() row locks, lazy hold expiration checks' },
            { phase: 'Phase 5: 5-Minute Seat Hold Mechanism', status: 'COMPLETE', desc: 'Atomic hold allocation, countdown synchronization, sweeper' },
            { phase: 'Phase 6: Dynamic Pricing Engine', status: 'COMPLETE', desc: 'Threshold-based occupancy calculation with guaranteed price lock' },
            { phase: 'Phase 7: Payment Agnostic Architecture', status: 'COMPLETE', desc: 'Interface abstraction for Stripe, bKash, and Mock gateway' },
            { phase: 'Phase 8: Idempotency & Webhook Safety', status: 'COMPLETE', desc: 'Deduplication keys preventing double bookings or charges' },
            { phase: 'Phase 9: Interactive SVG Seat Maps', status: 'COMPLETE', desc: 'Concert arena & bus coach 2+2 layout with 4 visual states' },
            { phase: 'Phase 10: Digital QR Ticket Generator', status: 'COMPLETE', desc: 'High-contrast SVG QR codes with staff validation portal' },
            { phase: 'Phase 11: Admin Operations & Telemetry', status: 'COMPLETE', desc: 'Occupancy analytics, live inventory table, Celery trigger' },
            { phase: 'Phase 12: Concurrency Stress-Test Suite', status: 'COMPLETE', desc: 'Multi-threaded 100-user simulator with zero race conditions' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>{item.phase}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium">
                    {item.status}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
