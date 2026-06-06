import React, { useContext, useEffect, useMemo, useState } from 'react';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import Popup from '../../common/Popup';
import { Link } from 'react-router-dom';
import TruckExpensesPopup from '../../../components/trucks/TruckExpensesPopup';

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthRange(shift = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + shift, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + shift + 1, 0);
  return { from: toISODate(start), to: toISODate(end) };
}

function fmtMoney(value) {
  const n = Number(value || 0);
  return `$${n.toFixed(2)}`;
}

function fmtMilesKm(value) {
  const miles = Number(value || 0);
  const km = miles * 1.60934;
  return `${miles.toFixed(2)} mi (${km.toFixed(2)} km)`;
}

export default function TrucksGrossEarning() {
  const { Errors } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('current');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTruck, setDetailTruck] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseTruck, setExpenseTruck] = useState(null);

  const fetchGross = (range = {}) => {
    setLoading(true);
    const qFrom = range.from ?? from;
    const qTo = range.to ?? to;
    const qs = new URLSearchParams();
    if (qFrom) qs.set('from', qFrom);
    if (qTo) qs.set('to', qTo);
    Api.get(`/account/trucks/gross?${qs.toString()}`)
      .then((res) => {
        if (res.data.status) setRows(res.data.trucks || []);
        else setRows([]);
      })
      .catch((err) => {
        setRows([]);
        Errors && Errors(err);
      })
      .finally(() => setLoading(false));
  };

  const openDetail = (truck) => {
    setDetailTruck(truck);
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    Api.get(`/account/trucks/gross/${truck.truckId}?${qs.toString()}`)
      .then((res) => {
        if (res.data.status) setDetail(res.data);
        else setDetail(null);
      })
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  };

  useEffect(() => {
    const r = monthRange(0);
    setMode('current');
    setFrom(r.from);
    setTo(r.to);
    fetchGross(r);
  }, []);

  const quickSelect = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'current') {
      const r = monthRange(0);
      setFrom(r.from);
      setTo(r.to);
      fetchGross(r);
      return;
    }
    if (nextMode === 'previous') {
      const r = monthRange(-1);
      setFrom(r.from);
      setTo(r.to);
      fetchGross(r);
    }
  };

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return rows;
    return (rows || []).filter((r) => {
      const plate = String(r?.plateNumber || '').toLowerCase();
      const unit = String(r?.unitNumber || '').toLowerCase();
      const lastLoc = String(r?.lastLocation || '').toLowerCase();
      const driver = String(r?.lastDriver?.name || '').toLowerCase();
      return plate.includes(q) || unit.includes(q) || lastLoc.includes(q) || driver.includes(q);
    });
  }, [rows, search]);

  return (
    <AuthLayout>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">Trucks Gross Earning</h2>
          <p className="text-xs text-gray-400 mt-1">
            Gross is calculated per order by mileage share (trip miles ÷ order total miles × order total amount)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            className="input-sm w-full sm:w-[260px]"
            placeholder="Search truck, driver, location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black border ${
            mode === 'current' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-300'
          }`}
          onClick={() => quickSelect('current')}
          disabled={loading}
        >
          This Month
        </button>
        <button
          className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black border ${
            mode === 'previous' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-300'
          }`}
          onClick={() => quickSelect('previous')}
          disabled={loading}
        >
          Last Month
        </button>
        <button
          className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black border ${
            mode === 'custom' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-300'
          }`}
          onClick={() => setMode('custom')}
          disabled={loading}
        >
          Custom Range
        </button>
      </div>

      {mode === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="input-item">
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">From</label>
            <input type="date" className="input-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="input-item">
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">To</label>
            <input type="date" className="input-sm" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn bg-gray-800 text-white w-full" onClick={() => fetchGross()} disabled={loading}>
              {loading ? 'Loading…' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-[#11131A] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-[1040px] w-full text-sm text-white">
            <thead className="bg-[#12161d] text-[#8A8FA3]">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Truck</th>
                <th className="text-left px-4 py-3 font-bold">Trips</th>
                <th className="text-left px-4 py-3 font-bold">Miles</th>
                <th className="text-left px-4 py-3 font-bold">Gross</th>
                <th className="text-left px-4 py-3 font-bold">Expenses</th>
                <th className="text-left px-4 py-3 font-bold">Profit</th>
                <th className="text-left px-4 py-3 font-bold">Last Driver</th>
                <th className="text-left px-4 py-3 font-bold">Last Location</th>
                <th className="text-right px-4 py-3 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-400" colSpan={7}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-400" colSpan={7}>
                    No trucks found
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((r) => (
                  <tr key={r.truckId} className="border-t border-white/5">
                    <td className="px-4 py-3 font-semibold">
                      {(r.unitNumber ? `${r.unitNumber} • ` : '') + (r.plateNumber || '—')}
                    </td>
                    <td className="px-4 py-3">{r.totalTrips || 0}</td>
                    <td className="px-4 py-3">{fmtMilesKm(r.totalMiles || 0)}</td>
                    <td className="px-4 py-3 text-green-400 font-bold">{fmtMoney(r.totalGross)}</td>
                    <td className="px-4 py-3 text-red-400 font-bold">{fmtMoney(r.totalExpenses)}</td>
                    <td className={`px-4 py-3 font-bold ${(r.profit || 0) >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                      {fmtMoney(r.profit)}
                    </td>
                    <td className="px-4 py-3">{r?.lastDriver?.name ? `${r.lastDriver.name}` : '—'}</td>
                    <td className="px-4 py-3 max-w-[320px] truncate">{r.lastLocation || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="btn sm bg-rose-600 hover:bg-rose-700 text-white"
                          onClick={() => { setExpenseTruck(r); setExpenseOpen(true); }}
                          disabled={!r.truckId}
                        >
                          Expenses
                        </button>
                        <button className="btn sm bg-gray-800 text-white" onClick={() => openDetail(r)} disabled={!r.truckId}>
                          Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <TruckExpensesPopup
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        truck={expenseTruck}
        grossData={expenseTruck}
      />

      <Popup open={detailOpen} onClose={() => setDetailOpen(false)} showTrigger={false} size="md:max-w-5xl" bg="bg-black" space="p-4 sm:p-6">
        <div className="text-white">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold truncate">Truck Gross Detail</h3>
              <p className="text-xs text-gray-400 truncate">
                {(detailTruck?.unitNumber ? `${detailTruck.unitNumber} • ` : '') + (detailTruck?.plateNumber || '')}
                {from || to ? ` • Range: ${from || '—'} to ${to || '—'}` : ''}
              </p>
            </div>
            <button className="text-gray-400 hover:text-white text-xl leading-none" onClick={() => setDetailOpen(false)} aria-label="Close">
              ×
            </button>
          </div>

          {detailLoading && <div className="text-gray-400 py-8 text-center">Loading…</div>}
          {!detailLoading && detail && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Trips</p>
                  <p className="text-xl font-black mt-1">{detail.summary?.totalTrips || 0}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Miles</p>
                  <p className="text-xl font-black mt-1">{fmtMilesKm(detail.summary?.totalMiles || 0)}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Gross</p>
                  <p className="text-xl font-black text-green-500 mt-1">{fmtMoney(detail.summary?.totalGross || 0)}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Expenses</p>
                  <p className="text-xl font-black text-red-400 mt-1">{fmtMoney(detail.summary?.totalExpenses || 0)}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Profit</p>
                  <p className={`text-xl font-black mt-1 ${(detail.summary?.profit || 0) >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                    {fmtMoney(detail.summary?.profit || 0)}
                  </p>
                </div>
              </div>

              {/* ---- EXPENSES TABLE ---- */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                    All Expenses
                    {detail.summary?.totalExpenses > 0 && (
                      <span className="ml-2 text-red-400">{fmtMoney(detail.summary.totalExpenses)}</span>
                    )}
                  </p>
                  <button
                    className="text-[10px] text-rose-400 hover:text-rose-300 uppercase font-bold"
                    onClick={() => { setDetailOpen(false); setExpenseTruck(detailTruck); setExpenseOpen(true); }}
                  >
                    + Add Expense
                  </button>
                </div>
                <div className="border border-gray-800 rounded-2xl overflow-hidden">
                  {(detail.expenses || []).length === 0 ? (
                    <div className="py-4 text-center text-gray-600 text-xs">No expenses recorded for this period</div>
                  ) : (
                    <div className="max-h-[200px] overflow-auto">
                      <table className="min-w-[540px] w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400 bg-gray-900 sticky top-0 text-xs">
                            <th className="px-3 py-2 font-bold">Date</th>
                            <th className="px-3 py-2 font-bold">Type</th>
                            <th className="px-3 py-2 font-bold">Paid By</th>
                            <th className="px-3 py-2 font-bold">Description</th>
                            <th className="px-3 py-2 text-right font-bold">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(detail.expenses || []).map((e, idx) => (
                            <tr key={idx} className="border-t border-gray-800">
                              <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                                {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                  e.type === 'fuel' ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' :
                                  e.type === 'toll' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                  e.type === 'service' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' :
                                  e.type === 'insurance' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                  e.type === 'parking' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' :
                                  'bg-gray-500/10 text-gray-300 border-gray-500/20'
                                }`}>
                                  {e.type}{e.isFixed ? ' ★' : ''}
                                </span>
                              </td>
                              <td className="px-3 py-2 capitalize text-gray-400">{e.paid_by}</td>
                              <td className="px-3 py-2 text-gray-400 max-w-[160px] truncate">{e.description || '—'}</td>
                              <td className="px-3 py-2 text-right text-red-400 font-bold">{fmtMoney(e.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* ---- ORDERS / GROSS TABLE ---- */}
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Order Breakdown</p>
                <div className="border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="max-h-[280px] overflow-auto">
                    <table className="min-w-[860px] w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 bg-gray-900 sticky top-0">
                          <th className="px-3 py-2">Order</th>
                          <th className="px-3 py-2">Trips</th>
                          <th className="px-3 py-2">Miles</th>
                          <th className="px-3 py-2">Order Miles</th>
                          <th className="px-3 py-2">Order Amount</th>
                          <th className="px-3 py-2 text-right">Gross</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.orders || []).map((o, idx) => (
                          <tr key={idx} className="border-t border-gray-800">
                            <td className="px-3 py-2">
                              <Link className="text-blue-400 hover:text-blue-300" to={`/view/order/${o._id}`}>
                                {o.orderSerial ? `#CMC${o.orderSerial}` : String(o._id).slice(-6)}
                              </Link>
                            </td>
                            <td className="px-3 py-2">{o.trips}</td>
                            <td className="px-3 py-2">{fmtMilesKm(o.miles || 0)}</td>
                            <td className="px-3 py-2">{fmtMilesKm(o.orderTotalDistance || 0)}</td>
                            <td className="px-3 py-2">{fmtMoney(o.orderTotalAmount || 0)}</td>
                            <td className="px-3 py-2 text-right text-green-400 font-bold">{fmtMoney(o.gross || 0)}</td>
                          </tr>
                        ))}
                        {(detail.orders || []).length === 0 && (
                          <tr>
                            <td className="px-3 py-10 text-gray-500" colSpan={6}>No trips in this range</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {!detailLoading && !detail && <div className="text-gray-400 py-8 text-center">No data</div>}
        </div>
      </Popup>
    </AuthLayout>
  );
}
