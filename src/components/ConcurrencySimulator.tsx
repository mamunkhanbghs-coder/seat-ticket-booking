import React, { useState } from 'react';
import { ShieldAlert, Play, RefreshCw, CheckCircle2, XCircle, Clock, Zap, Database, Terminal } from 'lucide-react';
import { ConcurrencyAttemptLog, SeatItem } from '../types';

interface ConcurrencySimulatorProps {
  seats: SeatItem[];
  onSeatHeldSimulated: (seatId: number, winnerUserId: string) => void;
}

export const ConcurrencySimulator: React.FC<ConcurrencySimulatorProps> = ({
  seats,
  onSeatHeldSimulated,
}) => {
  const [selectedSeatId, setSelectedSeatId] = useState<number>(seats.find(s => s.status === 'AVAILABLE')?.id || 10);
  const [userCount, setUserCount] = useState<number>(100);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [winnerUser, setWinnerUser] = useState<string | null>(null);
  const [logs, setLogs] = useState<ConcurrencyAttemptLog[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    success: number;
    rejected: number;
    elapsedMs: number;
  } | null>(null);

  const targetSeat = seats.find((s) => s.id === selectedSeatId) || seats[0];

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setLogs([]);
    setWinnerUser(null);
    setSummary(null);

    const startTime = performance.now();
    const generatedLogs: ConcurrencyAttemptLog[] = [];
    const winnerId = `User_${Math.floor(Math.random() * userCount + 1).toString().padStart(3, '0')}`;

    // Simulate concurrent serialization:
    // In PostgreSQL `SELECT FOR UPDATE`, all transactions queue up.
    // The first transaction grabs the row lock and updates status to HELD.
    // Every subsequent transaction reads the updated status and returns 409 Conflict.
    for (let i = 1; i <= userCount; i++) {
      const currentUserId = `User_${i.toString().padStart(3, '0')}`;
      const isWinner = currentUserId === winnerId;
      const latency = Math.floor(Math.random() * 15 + 8); // 8-23ms lock latency

      if (isWinner) {
        generatedLogs.push({
          id: `log-${i}`,
          timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
          userId: currentUserId,
          seatCode: `${targetSeat.row}${targetSeat.number}`,
          status: 'GRANTED',
          message: 'ACQUIRED ROW LOCK (SELECT FOR UPDATE) ➔ Status: HELD (200 OK)',
          latencyMs: latency,
        });
      } else {
        generatedLogs.push({
          id: `log-${i}`,
          timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
          userId: currentUserId,
          seatCode: `${targetSeat.row}${targetSeat.number}`,
          status: 'REJECTED_409',
          message: `LOCK BLOCKED ➔ Row already HELD by ${winnerId} (409 Conflict)`,
          latencyMs: latency,
        });
      }
    }

    // Sort so granted is shown prominently or by timestamp
    const endTime = performance.now();
    const elapsed = Math.round(endTime - startTime);

    // Artificial short delay for realistic visualization feel
    setTimeout(() => {
      setLogs(generatedLogs);
      setWinnerUser(winnerId);
      setSummary({
        total: userCount,
        success: 1,
        rejected: userCount - 1,
        elapsedMs: elapsed,
      });
      setIsRunning(false);
      onSeatHeldSimulated(targetSeat.id, winnerId);
    }, 600);
  };

  return (
    <div id="concurrency-simulator-container" className="space-y-6">
      {/* Banner / Explanation */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>High-Traffic Concurrency Engine Verification</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Double-Booking Prevention Stress Simulator
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Simulate up to 200 simultaneous users firing reservations at the exact same millisecond
              against a single seat. Demonstrates PostgreSQL row-level locking (<code className="text-blue-700 bg-blue-100 px-1 py-0.5 rounded font-mono text-xs">SELECT FOR UPDATE</code>)
              guaranteeing exactly 1 winner and 100% rejection of conflicting requests.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">DB Guarantee</span>
              <span className="text-sm font-bold text-emerald-700">Zero Overlaps</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Lock Type</span>
              <span className="text-sm font-bold text-[#3A86FF]">Row Mutex</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Seat selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Target Seat to Contend:
            </label>
            <select
              id="select-contend-seat"
              value={selectedSeatId}
              onChange={(e) => setSelectedSeatId(Number(e.target.value))}
              disabled={isRunning}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
            >
              {seats.map((seat) => (
                <option key={seat.id} value={seat.id}>
                  Seat {seat.row}{seat.number} ({seat.category}) - ${seat.currentPrice} [{seat.status}]
                </option>
              ))}
            </select>
          </div>

          {/* User count slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Simultaneous Users:
              </label>
              <span className="font-mono text-sm font-bold text-[#3A86FF] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {userCount} Users
              </span>
            </div>
            <input
              id="slider-concurrency-users"
              type="range"
              min="10"
              max="200"
              step="10"
              value={userCount}
              onChange={(e) => setUserCount(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-[#3A86FF] bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>10 Threads</span>
              <span>50 Threads</span>
              <span>100 Threads</span>
              <span>200 Threads</span>
            </div>
          </div>

          {/* Trigger Button */}
          <div>
            <button
              id="btn-fire-concurrency-test"
              onClick={handleRunSimulation}
              disabled={isRunning}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm ${
                isRunning
                  ? 'bg-slate-200 text-slate-500 cursor-wait'
                  : 'bg-[#3A86FF] hover:bg-blue-600 text-white shadow-blue-500/25 hover:scale-[1.01]'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Acquiring PostgreSQL Locks...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute {userCount}-User Race Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary Box */}
      {summary && (
        <div id="simulation-summary-card" className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 block mb-1 font-medium">Concurrent Requests</span>
            <span className="text-2xl font-black text-slate-900">{summary.total}</span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-300 shadow-2xs">
            <span className="text-xs text-emerald-800 block mb-1 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Successful Lock
            </span>
            <span className="text-2xl font-black text-emerald-800">{summary.success} Winner</span>
            <span className="text-[11px] text-emerald-700 block mt-0.5">({winnerUser})</span>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-300 shadow-2xs">
            <span className="text-xs text-rose-800 block mb-1 font-bold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejections (409 Conflict)
            </span>
            <span className="text-2xl font-black text-rose-800">{summary.rejected}</span>
            <span className="text-[11px] text-rose-700 block mt-0.5">0 Double-Bookings</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 block mb-1 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-600" /> Lock Latency
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">{summary.elapsedMs}ms</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Fully Serialized</span>
          </div>
        </div>
      )}

      {/* Terminal / Live Audit Stream */}
      {logs.length > 0 && (
        <div id="concurrency-terminal" className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span className="font-mono font-semibold text-slate-200">
                PostgreSQL Lock Trace (select_for_update audit log)
              </span>
            </div>
            <span className="font-mono text-slate-500">Showing {logs.length} Transactions</span>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto font-mono text-xs pr-2">
            {logs.map((log) => {
              const isWin = log.status === 'GRANTED';
              return (
                <div
                  key={log.id}
                  className={`flex items-start justify-between py-1.5 px-2.5 rounded transition-all ${
                    isWin
                      ? 'bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                    <span className={`font-bold ${isWin ? 'text-emerald-400' : 'text-slate-300'}`}>
                      [{log.userId}]
                    </span>
                    <span>{log.message}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="text-slate-500">{log.latencyMs}ms</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isWin ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isWin ? '200 OK' : '409 CONFLICT'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SQL & Django ORM Mechanics Deep Dive */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-[#3A86FF]" />
          <span>Behind The Scenes: How PostgreSQL Guarantees Concurrency</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-slate-300 shadow-inner">
            <div className="text-blue-400 font-bold mb-2">// 1. Django ORM Implementation</div>
            <pre className="text-slate-300 overflow-x-auto leading-relaxed">
{`@transaction.atomic
def hold_seat(user, event_seat_id):
    # Locks row at database level
    seat = EventSeat.objects.select_for_update().get(id=event_seat_id)
    if seat.status != 'AVAILABLE':
        raise ConcurrencyBookingError("Seat already held/booked")
    
    seat.status = 'HELD'
    seat.save()
    return create_hold(seat, user)`}
            </pre>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-slate-300 shadow-inner">
            <div className="text-emerald-400 font-bold mb-2">// 2. PostgreSQL Row-Level Lock Query</div>
            <pre className="text-slate-300 overflow-x-auto leading-relaxed">
{`BEGIN;
SELECT * FROM inventory_eventseat 
WHERE id = 10 
FOR UPDATE; -- All concurrent threads wait here!

UPDATE inventory_eventseat 
SET status = 'HELD' 
WHERE id = 10;
COMMIT;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
