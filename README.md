# High-Traffic Ticket & Seat Booking Platform (Django + PostgreSQL + Redis + Celery)

A production-grade, high-concurrency ticket and seat reservation backend engine and interactive booking platform designed to eliminate race conditions, guarantee zero double-bookings under peak traffic spikes, enforce strict 5-minute atomic seat holds, and calculate real-time dynamic pricing.

---

## 🌟 Core Architectural Guarantees

1. **Double-Booking Prevention (PostgreSQL Row-Level Locks)**
   - When any user attempts to reserve or checkout a seat, Django initiates `transaction.atomic()` and issues `EventSeat.objects.select_for_update().get(id=seat_id)`.
   - Any concurrent request attempting to lock the exact same seat row blocks at the PostgreSQL storage engine level.
   - The first transaction reads `status=AVAILABLE`, transitions it to `HELD` or `BOOKED`, and commits.
   - All competing transactions unblock, inspect the newly committed state (`HELD` or `BOOKED`), and immediately return HTTP `409 Conflict`. Zero double-bookings can occur.

2. **5-Minute Atomic Seat Hold & Lazy Sweeping**
   - Held seats store an exact UTC expiration timestamp (`expires_at = now + 5 minutes`).
   - Active Celery Beat tasks clean up expired holds every 30 seconds (`release_expired_holds_task`).
   - **Lazy Expiration Check**: If a background Celery worker ever pauses or lags under queue saturation, incoming booking/hold requests inspect `existing_hold.expires_at <= now` directly during `select_for_update()`, freeing expired seats immediately without waiting on Celery.

3. **Dynamic Pricing Engine with Price Lock**
   - Configurable occupancy-based pricing tiers:
     - `0% - 50% Occupancy`  → Base Price
     - `51% - 70% Occupancy` → Base + 10%
     - `71% - 85% Occupancy` → Base + 20%
     - `86% - 95% Occupancy` → Base + 35%
     - `96% - 100% Occupancy`→ Base + 50%
   - **Price Lock Policy**: Once a seat is successfully held, the calculated price is locked into `SeatHold.locked_price`. Even if other users purchase 50 seats while the user is typing their payment info, the checkout price remains guaranteed for the 5-minute hold window.

4. **Multi-Model Support (Concerts & Bus Travel)**
   - Generic inventory engine supporting both arena venues (Section/Row/SeatNumber with VIP, Premium, Regular tiers) and long-distance buses (e.g. Dhaka to Chattogram 2+2 layout).

---

## ⚙️ Technology Stack

- **Backend**: Python 3.10+, Django 5.0+, Django REST Framework
- **Primary Database**: PostgreSQL 15+ (ACID transactions, `SELECT FOR UPDATE` row locks, B-tree indexes)
- **Cache & Message Broker**: Redis 7+
- **Background & Periodic Workers**: Celery 5.3+ & `django-celery-beat`
- **Frontend / Interface**: Modern HTML5, Tailwind CSS, Lucide Icons, interactive SVG seat layout, live countdown timers
- **Testing & Benchmarking**: Pytest, Django Test Runner, Multi-threaded Concurrency Harness, Locust Load Generator

---

## 🚀 Windows / VS Code Development Setup

### 1. Clone & Setup Virtual Environment
```cmd
git clone https://github.com/mamunkhanbghs/ticket-booking-platform.git
cd ticket-booking-platform

:: Create Python virtual environment
python -m venv venv

:: Activate in Windows CMD / PowerShell
venv\Scripts\activate
```

### 2. Install Dependencies
```cmd
pip install -r requirements.txt
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```cmd
copy .env.example .env
```
Ensure your PostgreSQL credentials and Redis URLs are configured in `.env`.

### 4. Database Migrations
```cmd
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Start Background Workers (In Separate Terminals)
**Terminal 2 (Celery Worker):**
```cmd
venv\Scripts\activate
celery -A config worker --loglevel=info -P solo
```
*(Note: On Windows, use `-P solo` or `-P threads` for Celery worker processes).*

**Terminal 3 (Celery Beat Scheduler):**
```cmd
venv\Scripts\activate
celery -A config beat --loglevel=info
```

### 6. Run Development Server
**Terminal 1:**
```cmd
python manage.py runserver
```
Navigate to `http://localhost:8000/`.

---

## 🐳 Docker Production Setup

To run the complete production stack (Postgres, Redis, Web Django, Celery Worker, Celery Beat) in one command:

```bash
docker-compose up --build -d
```

Check logs:
```bash
docker-compose logs -f web
```

---

## 🧪 Testing & Verification

### 1. Run Concurrency Stress Test (100 Simultaneous Threads Booking 1 Seat)
```bash
python tests/test_concurrency.py
```
**Expected Output:**
```text
=== CONCURRENCY TEST RESULT ===
Total concurrent users: 100
Successful holds: 1
Rejected attempts (409 Conflict): 99
WINNER: User_001 acquired seat A10.
CONCURRENCY SAFETY VERIFIED: ZERO DOUBLE-BOOKINGS.
```

### 2. Run Locust High-Traffic Load Test
```bash
locust -f tests/locustfile.py --host=http://localhost:8000
```
Open `http://localhost:8089` to spawn 500 to 5,000 concurrent simulated booking users.

---

## 📄 License & Attribution

**All Credits Reserved by [Mamun Khan](https://aamkhan.vercel.app/)**
Website: [https://aamkhan.vercel.app/](https://aamkhan.vercel.app/)
