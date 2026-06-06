import React, { useEffect, useState } from 'react';
import Popup from '../../pages/common/Popup';
import Api from '../../api/Api';
import { toast } from 'react-hot-toast';
import TimeFormat from '../../pages/common/TimeFormat';
import { Link } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';

const toISODate = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const monthRange = (shift = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + shift, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + shift + 1, 0);
  return { from: toISODate(start), to: toISODate(end) };
};

const fmtMoney = (value) => {
  const n = Number(value || 0);
  return `$${n.toFixed(2)}`;
};

const fmtMilesKm = (value) => {
  const miles = Number(value || 0);
  const km = miles * 1.60934;
  return `${miles.toFixed(2)} mi (${km.toFixed(2)} km)`;
};

export default function DriverLogsPopup({ driver, open, onClose }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState('current');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchLogs = async (override = {}) => {
    if (!driver?._id) return;
    setLoading(true);
    try {
      const qFrom = override.from ?? from;
      const qTo = override.to ?? to;
      const qs = new URLSearchParams();
      if (qFrom) qs.set('from', qFrom);
      if (qTo) qs.set('to', qTo);
      qs.set('includeEmptyMiles', '1');
      const url = `/driver/${driver._id}/trips/logs?${qs.toString()}`;
      const res = await Api.get(url);
      if (res.data.status) {
        setLogs(res.data.logs || []);
        setSummary(res.data.summary || null);
      } else {
        toast.error('Failed to load driver logs');
      }
    } catch {
      toast.error('Failed to load driver logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      const r = monthRange(0);
      setMode('current');
      setFrom(r.from);
      setTo(r.to);
      fetchLogs(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const quickSelect = async (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'current') {
      const r = monthRange(0);
      setFrom(r.from);
      setTo(r.to);
      await fetchLogs(r);
      return;
    }
    if (nextMode === 'previous') {
      const r = monthRange(-1);
      setFrom(r.from);
      setTo(r.to);
      await fetchLogs(r);
      return;
    }
  };

  const handleIgnoreEmptyMove = async (l) => {
    if (!window.confirm('Are you sure you want to remove this empty move from the calculations?')) return;
    try {
      const payload = {
        driverId: driver._id,
        after_trip_id: l.after_trip_id,
        before_trip_id: l.before_trip_id
      };
      const res = await Api.post('/empty-moves/ignore', payload);
      if (res.data.status) {
        toast.success(res.data.message);
        fetchLogs({ from, to });
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error('Error removing empty move');
    }
  };

  const handleEditEmptyNote = async (l) => {
    const note = window.prompt('Enter note for this empty move:', l.note || '');
    if (note === null) return; // User cancelled

    try {
      const payload = {
        driverId: driver._id,
        after_trip_id: l.after_trip_id,
        before_trip_id: l.before_trip_id,
        note
      };
      const res = await Api.post('/empty-moves/note', payload);
      if (res.data.status) {
        toast.success(res.data.message);
        fetchLogs({ from, to });
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error('Error saving note');
    }
  };

  return (
    <Popup open={open} onClose={onClose} showTrigger={false} size="md:max-w-5xl" bg="bg-black" space="p-4 sm:p-6">
      <div className="text-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">Driver Logs</h2>
            <p className="text-xs text-gray-400 truncate">
              {driver?.name} • ID: {driver?.corporateID || '—'} • <TimeFormat date={new Date()} time={false} />
            </p>
          </div>
          <button className="text-gray-400 hover:text-white text-xl leading-none" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black border ${mode === 'current' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-300'}`}
            onClick={() => quickSelect('current')}
            disabled={loading}
          >
            This Month
          </button>
          <button
            className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black border ${mode === 'previous' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-300'}`}
            onClick={() => quickSelect('previous')}
            disabled={loading}
          >
            Last Month
          </button>
          <button
            className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black border ${mode === 'custom' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-300'}`}
            onClick={() => setMode('custom')}
            disabled={loading}
          >
            Custom Range
          </button>
        </div>

        {mode === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="input-item">
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">From</label>
              <input type="date" className="input-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="input-item">
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">To</label>
              <input type="date" className="input-sm" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button className="btn bg-gray-800 text-white w-full" onClick={() => fetchLogs()} disabled={loading}>
                {loading ? 'Loading…' : 'Apply'}
              </button>
            </div>
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-black text-gray-500">Trip Distance</div>
              <div className="text-white text-lg font-bold">{fmtMilesKm(summary.loadedMiles || 0)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-black text-gray-500">Empty Distance</div>
              <div className="text-white text-lg font-bold">{fmtMilesKm(summary.emptyMiles || 0)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-black text-gray-500">Total Distance</div>
              <div className="text-white text-lg font-bold">{fmtMilesKm(summary.totalMiles || 0)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-black text-gray-500">Total Gross</div>
              <div className="text-white text-lg font-bold">{fmtMoney(summary.totalGross || 0)}</div>
            </div>
          </div>
        )}

        <div className="border border-gray-800 rounded-2xl overflow-hidden">
          <div className="max-h-[520px] overflow-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-900 sticky top-0">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">From</th>
                  <th className="px-3 py-2">To</th>
                  <th className="px-3 py-2">Truck</th>
                  <th className="px-3 py-2 text-right">Distance</th>
                  <th className="px-3 py-2 text-right">Gross</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td className="px-3 py-10 text-gray-500" colSpan={8}>Loading…</td></tr>
                )}
                {!loading && logs.map((l, idx) => (
                  <tr key={idx} className="border-t border-gray-800">
                    <td className="px-3 py-2 text-gray-300">{l.createdAt ? new Date(l.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-3 py-2">
                      {l.type === 'trip' ? (
                        <Link className="text-blue-400 hover:text-blue-300" to={`/view/order/${l.orderId}`}>
                          {l.orderSerial ? `#CMC${l.orderSerial}` : String(l.orderId || '').slice(-6)}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {l.type === 'empty' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-yellow-500/30 text-yellow-300 bg-yellow-500/10">
                            Empty
                          </span>
                          <button 
                              onClick={() => handleEditEmptyNote(l)}
                              className="text-gray-500 hover:text-blue-400 p-1 transition-colors"
                              title="Add or edit note"
                          >
                              <FaEdit size={12} />
                          </button>
                          <button 
                              onClick={() => handleIgnoreEmptyMove(l)}
                              className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                              title="Remove this empty distance"
                          >
                              <FaTrash size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                          Trip
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 max-w-[320px] truncate">
                      {l.type === 'empty' ? (
                        <div>
                          {l.from_location}
                          {l.note && (
                              <div className="text-[10px] text-blue-400 mt-1 flex items-start gap-1">
                                  <span className="font-bold">Note:</span>
                                  <span className="whitespace-normal break-words">{l.note}</span>
                              </div>
                          )}
                        </div>
                      ) : (
                        l.start_location
                      )}
                    </td>
                    <td className="px-3 py-2 max-w-[320px] truncate">{l.type === 'empty' ? l.to_location : l.end_location}</td>
                    <td className="px-3 py-2">{l.type === 'trip' && l.truck ? `${[l.truck.make, l.truck.model].filter(Boolean).join(' ') || l.truck.unitNumber || '—'} ${l.truck.plateNumber ? `(${l.truck.plateNumber})` : ''}` : '—'}</td>
                    <td className="px-3 py-2 text-right">
                      {typeof l.miles === 'number' ? fmtMilesKm(l.miles || 0) : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {l.type === 'trip' ? fmtMoney(l.gross || 0) : '—'}
                    </td>
                  </tr>
                ))}
                {!loading && logs.length === 0 && (
                  <tr><td className="px-3 py-10 text-gray-500" colSpan={8}>No logs in this range</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Popup>
  );
}
