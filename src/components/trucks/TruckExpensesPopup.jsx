import React, { useEffect, useState, useCallback } from 'react';
import Popup from '../../pages/common/Popup';
import Api from '../../api/Api';
import { toast } from 'react-hot-toast';

const EXPENSE_TYPES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'toll', label: 'Toll' },
  { value: 'service', label: 'Service / Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'parking', label: 'Parking' },
  { value: 'other', label: 'Other' }
];

const TYPE_COLORS = {
  fuel: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  toll: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  service: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
  insurance: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  parking: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  other: 'bg-gray-500/10 text-gray-300 border-gray-500/20'
};

function fmtMoney(v) {
  return `$${Number(v || 0).toFixed(2)}`;
}

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

export default function TruckExpensesPopup({ truck, open, onClose, grossData }) {
  const [mode, setMode] = useState('current');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'fuel', amount: '', paid_by: 'owner', description: '', date: toISODate(new Date()) });

  const fetchExpenses = useCallback((range) => {
    if (!truck?._id && !truck?.truckId) return;
    const truckId = truck._id || truck.truckId;
    setLoading(true);
    const qs = new URLSearchParams();
    if (range?.from) qs.set('from', range.from);
    if (range?.to) qs.set('to', range.to);
    Api.get(`/truck/${truckId}/expenses?${qs.toString()}`)
      .then((res) => {
        if (res.data.status) {
          setExpenses(res.data.expenses || []);
          setTotalExpenses(res.data.totalExpenses || 0);
        }
      })
      .catch(() => toast.error('Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [truck]);

  useEffect(() => {
    if (open) {
      const r = monthRange(0);
      setMode('current');
      setFrom(r.from);
      setTo(r.to);
      fetchExpenses(r);
    }
  }, [open, truck]);

  const quickSelect = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'current') {
      const r = monthRange(0);
      setFrom(r.from); setTo(r.to);
      fetchExpenses(r);
    } else if (nextMode === 'previous') {
      const r = monthRange(-1);
      setFrom(r.from); setTo(r.to);
      fetchExpenses(r);
    }
  };

  const handleAdd = () => {
    if (!form.amount || !form.date || !form.type) {
      toast.error('Type, amount and date are required');
      return;
    }
    const truckId = truck._id || truck.truckId;
    setAdding(true);
    Api.post(`/truck/${truckId}/expense`, form)
      .then((res) => {
        if (res.data.status) {
          toast.success('Expense added');
          setShowForm(false);
          setForm({ type: 'fuel', amount: '', paid_by: 'owner', description: '', date: toISODate(new Date()) });
          fetchExpenses({ from, to });
        } else {
          toast.error(res.data.message || 'Failed');
        }
      })
      .catch(() => toast.error('Failed to add expense'))
      .finally(() => setAdding(false));
  };

  const handleDelete = (expenseId) => {
    const truckId = truck._id || truck.truckId;
    setDeleting(expenseId);
    Api.delete(`/truck/${truckId}/expense/${expenseId}`)
      .then((res) => {
        if (res.data.status) {
          toast.success('Expense deleted');
          fetchExpenses({ from, to });
        }
      })
      .catch(() => toast.error('Failed to delete'))
      .finally(() => setDeleting(null));
  };

  const gross = grossData?.totalGross || 0;
  const profit = gross - totalExpenses;

  return (
    <Popup open={open} onClose={onClose} showTrigger={false} size="md:max-w-4xl" bg="bg-black" space="p-4 sm:p-6">
      <div className="text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold">Truck Expenses</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {truck?.unitNumber ? `${truck.unitNumber} • ` : ''}{truck?.plateNumber || ''}
            </p>
          </div>
          <button className="text-gray-400 hover:text-white text-xl leading-none" onClick={onClose}>×</button>
        </div>

        {/* Date range selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['current', 'previous', 'custom'].map((m) => (
            <button
              key={m}
              className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black border ${
                mode === m ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-300'
              }`}
              onClick={() => quickSelect(m)}
            >
              {m === 'current' ? 'This Month' : m === 'previous' ? 'Last Month' : 'Custom'}
            </button>
          ))}
        </div>

        {mode === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">From</label>
              <input type="date" className="input-sm w-full" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">To</label>
              <input type="date" className="input-sm w-full" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button className="btn bg-gray-800 text-white w-full" onClick={() => fetchExpenses({ from, to })}>
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Gross</p>
            <p className="text-xl font-black text-green-400 mt-1">{fmtMoney(gross)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Expenses</p>
            <p className="text-xl font-black text-red-400 mt-1">{fmtMoney(totalExpenses)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Profit</p>
            <p className={`text-xl font-black mt-1 ${profit >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
              {fmtMoney(profit)}
            </p>
          </div>
        </div>

        {/* Add expense button / form */}
        {!showForm ? (
          <button
            className="btn bg-rose-600 hover:bg-rose-700 text-white text-sm mb-4"
            onClick={() => setShowForm(true)}
          >
            + Add Expense
          </button>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">New Expense</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Type</label>
                <select
                  className="input-sm w-full"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {EXPENSE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-sm w-full"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Date</label>
                <input
                  type="date"
                  className="input-sm w-full"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Paid By</label>
                <select
                  className="input-sm w-full"
                  value={form.paid_by}
                  onChange={(e) => setForm((f) => ({ ...f, paid_by: e.target.value }))}
                >
                  <option value="owner">Owner</option>
                  <option value="driver">Driver</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Description</label>
                <input
                  type="text"
                  className="input-sm w-full"
                  placeholder="Optional note"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                className="btn bg-rose-600 hover:bg-rose-700 text-white text-sm"
                onClick={handleAdd}
                disabled={adding}
              >
                {adding ? 'Saving…' : 'Save Expense'}
              </button>
              <button
                className="btn bg-gray-800 text-gray-300 text-sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Expenses list */}
        <div className="border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
          ) : expenses.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-sm">No expenses in this period</div>
          ) : (
            <div className="overflow-auto max-h-[320px]">
              <table className="min-w-[620px] w-full text-sm">
                <thead className="bg-gray-900 sticky top-0">
                  <tr className="text-left text-gray-400 text-xs uppercase">
                    <th className="px-4 py-2 font-bold">Date</th>
                    <th className="px-4 py-2 font-bold">Type</th>
                    <th className="px-4 py-2 font-bold">Amount</th>
                    <th className="px-4 py-2 font-bold">Paid By</th>
                    <th className="px-4 py-2 font-bold">Description</th>
                    <th className="px-4 py-2 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e._id} className="border-t border-gray-800">
                      <td className="px-4 py-2 text-gray-300">
                        {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${TYPE_COLORS[e.type] || TYPE_COLORS.other}`}>
                          {e.type}
                          {e.isFixed && <span className="ml-1 opacity-60">AUTO</span>}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-bold text-red-400">{fmtMoney(e.amount)}</td>
                      <td className="px-4 py-2 capitalize text-gray-300">{e.paid_by}</td>
                      <td className="px-4 py-2 text-gray-400 max-w-[180px] truncate">{e.description || '—'}</td>
                      <td className="px-4 py-2 text-right">
                        {!e.isFixed && (
                          <button
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40"
                            onClick={() => handleDelete(e._id)}
                            disabled={deleting === e._id}
                          >
                            {deleting === e._id ? '…' : 'Delete'}
                          </button>
                        )}
                        {e.isFixed && <span className="text-xs text-gray-600">Fixed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
}
