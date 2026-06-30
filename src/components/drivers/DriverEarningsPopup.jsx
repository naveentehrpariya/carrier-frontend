import React, { useEffect, useState, useCallback } from 'react';
import Popup from '../../pages/common/Popup';
import Api from '../../api/Api';
import { toast } from 'react-hot-toast';
import TimeFormat from '../../pages/common/TimeFormat';
import { Link } from 'react-router-dom';
import Currency from '../../pages/common/Currency';

const DEDUCTION_TYPES = [
  { value: 'advance', label: 'Advance / Loan', direction: 'deduct' },
  { value: 'fine', label: 'Fine / Penalty', direction: 'deduct' },
  { value: 'insurance', label: 'Insurance Deduction', direction: 'deduct' },
  { value: 'other', label: 'Other Deduction', direction: 'deduct' },
];

function toISODate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtMilesKm(value) {
  const miles = Number(value || 0);
  const km = miles * 1.609344;
  return `${miles.toFixed(2)} mi (${km.toFixed(2)} km)`;
}

function monthRangeFor(month, year) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { from: toISODate(start), to: toISODate(end) };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DriverEarningsPopup({ driver, open, onClose }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  // City hours (DB-backed)
  const [cityHours, setCityHours] = useState([]);
  const [totalCityPay, setTotalCityPay] = useState(0);
  const [newCityDate, setNewCityDate] = useState('');
  const [newCityHours, setNewCityHours] = useState('');
  const [savingCity, setSavingCity] = useState(false);

  // Deductions (DB-backed)
  const [deductionItems, setDeductionItems] = useState([]);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [showDeductForm, setShowDeductForm] = useState(false);
  const [deductForm, setDeductForm] = useState({ type: 'advance', amount: '', description: '', date: toISODate(new Date()) });
  const [savingDeduct, setSavingDeduct] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const cityRate = Number(driver?.driverProfile?.cityHoursRate || 0);

  // Monthly payslip (parity with owner-operator salary)
  const _now = new Date();
  const [selMonth, setSelMonth] = useState(_now.getMonth() + 1);
  const [selYear, setSelYear] = useState(_now.getFullYear());
  const [payCurrency, setPayCurrency] = useState('CAD');
  const [salary, setSalary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchSummary = useCallback(async (override = {}) => {
    if (!driver?._id) return;
    setLoading(true);
    try {
      const qFrom = override.from ?? from;
      const qTo = override.to ?? to;
      const url = `/driver/${driver._id}/trips/summary` +
        (qFrom || qTo ? `?${new URLSearchParams({ from: qFrom, to: qTo }).toString()}` : '');
      const res = await Api.get(url);
      if (res.data.status) {
        setSummary(res.data.summary);
        setOrders(res.data.byOrder || []);
      } else {
        toast.error('Failed to load earnings');
      }
    } catch {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  }, [driver, from, to]);

  const fetchDeductions = useCallback(async (override = {}) => {
    if (!driver?._id) return;
    const qFrom = override.from ?? from;
    const qTo = override.to ?? to;
    const qs = new URLSearchParams();
    if (qFrom) qs.set('from', qFrom);
    if (qTo) qs.set('to', qTo);
    try {
      const res = await Api.get(`/driver/${driver._id}/deductions?${qs.toString()}`);
      if (res.data.status) {
        setCityHours(res.data.cityHours || []);
        setTotalCityPay(res.data.totalCityPay || 0);
        setDeductionItems(res.data.deductionItems || []);
        setTotalDeductions(res.data.totalDeductions || 0);
      }
    } catch {
      // silent — deductions are additive data
    }
  }, [driver, from, to]);

  const fetchSalary = useCallback(async (month, year, currency) => {
    if (!driver?._id) return;
    try {
      const qs = new URLSearchParams({ month: String(month), year: String(year), currency });
      const res = await Api.get(`/driver/${driver._id}/salary?${qs.toString()}`);
      if (res.data.status) setSalary(res.data.salary || null);
    } catch {
      setSalary(null);
    }
  }, [driver]);

  const fetchHistory = useCallback(async () => {
    if (!driver?._id) return;
    try {
      const res = await Api.get(`/driver/${driver._id}/salary/history`);
      if (res.data.status) setHistory(res.data.lists || []);
    } catch {
      setHistory([]);
    }
  }, [driver]);

  // Load everything for a given month/year/currency.
  const loadMonth = useCallback(async (month, year, currency) => {
    const r = monthRangeFor(month, year);
    setFrom(r.from);
    setTo(r.to);
    await Promise.all([fetchSummary(r), fetchDeductions(r), fetchSalary(month, year, currency), fetchHistory()]);
  }, [fetchSummary, fetchDeductions, fetchSalary, fetchHistory]);

  const generatePayslip = async () => {
    if (!driver?._id) return;
    setGenerating(true);
    try {
      const res = await Api.post(`/driver/${driver._id}/salary/generate`, {
        month: selMonth, year: selYear, currency: payCurrency,
      });
      if (res.data.status) {
        setSalary(res.data.salary);
        toast.success('Payslip generated');
        await loadMonth(selMonth, selYear, payCurrency);
      } else {
        toast.error(res.data.message || 'Failed to generate payslip');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to generate payslip');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (open) {
      const m = _now.getMonth() + 1;
      const y = _now.getFullYear();
      setSelMonth(m);
      setSelYear(y);
      setNewCityDate('');
      setNewCityHours('');
      setShowDeductForm(false);
      loadMonth(m, y, payCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, driver?._id]);

  const addCityHour = async () => {
    const hours = Number(newCityHours);
    if (!newCityDate) return toast.error('Please select a date');
    if (!Number.isFinite(hours) || hours <= 0) return toast.error('Please enter valid hours');
    setSavingCity(true);
    try {
      const res = await Api.post(`/driver/${driver._id}/deduction`, {
        type: 'city_hours',
        direction: 'add',
        hours,
        rate: cityRate,
        date: newCityDate,
        description: `City hours`
      });
      if (res.data.status) {
        setNewCityDate('');
        setNewCityHours('');
        await Promise.all([fetchDeductions({ from, to }), fetchSalary(selMonth, selYear, payCurrency)]);
        toast.success('City hours saved');
      } else {
        toast.error(res.data.message || 'Failed');
      }
    } catch {
      toast.error('Failed to save city hours');
    } finally {
      setSavingCity(false);
    }
  };

  const removeCityHour = async (id) => {
    setDeletingId(id);
    try {
      await Api.delete(`/driver/${driver._id}/deduction/${id}`);
      await Promise.all([fetchDeductions({ from, to }), fetchSalary(selMonth, selYear, payCurrency)]);
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    } finally {
      setDeletingId(null);
    }
  };

  const addDeduction = async () => {
    if (!deductForm.amount || !deductForm.date) {
      return toast.error('Amount and date required');
    }
    const typeObj = DEDUCTION_TYPES.find((t) => t.value === deductForm.type);
    setSavingDeduct(true);
    try {
      const res = await Api.post(`/driver/${driver._id}/deduction`, {
        type: deductForm.type,
        direction: typeObj?.direction || 'deduct',
        amount: Number(deductForm.amount),
        description: deductForm.description,
        date: deductForm.date
      });
      if (res.data.status) {
        setDeductForm({ type: 'advance', amount: '', description: '', date: toISODate(new Date()) });
        setShowDeductForm(false);
        await Promise.all([fetchDeductions({ from, to }), fetchSalary(selMonth, selYear, payCurrency)]);
        toast.success('Deduction saved');
      } else {
        toast.error(res.data.message || 'Failed');
      }
    } catch {
      toast.error('Failed to save deduction');
    } finally {
      setSavingDeduct(false);
    }
  };

  const removeDeduction = async (id) => {
    setDeletingId(id);
    try {
      await Api.delete(`/driver/${driver._id}/deduction/${id}`);
      await Promise.all([fetchDeductions({ from, to }), fetchSalary(selMonth, selYear, payCurrency)]);
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    } finally {
      setDeletingId(null);
    }
  };

  const tripPay = Number(summary?.totalPay || 0);
  const totalPayWithCity = tripPay + totalCityPay;
  const netPay = totalPayWithCity - totalDeductions;
  const moneyCurrency = String(summary?.currency || 'USD').toUpperCase();

  // Backend-generated PDF (puppeteer, company/default logo, currency-aware). Defaults to the
  // selected month; pass month/year/currency to download a specific generated payslip.
  const exportPDF = async (month = selMonth, year = selYear, currency = payCurrency) => {
    if (!driver?._id) return;
    try {
      const qs = new URLSearchParams({ month: String(month), year: String(year), currency });
      const res = await Api.get(`/driver/${driver._id}/salary/pdf?${qs.toString()}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Driver_Statement_${(driver?.name || 'driver').replace(/\s+/g, '_')}_${month}_${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <Popup open={open} onClose={onClose} showTrigger={false} size="md:max-w-4xl" bg="bg-black" space="p-4 sm:p-6">
      <div className="text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">Driver Earnings</h2>
            <p className="text-xs text-gray-400 truncate">
              {driver?.name} • ID: {driver?.corporateID || '—'} • <TimeFormat date={new Date()} time={false} />
            </p>
          </div>
          <button className="text-gray-400 hover:text-white text-xl leading-none" onClick={onClose}>×</button>
        </div>

        {/* Month / Year / Currency picker + actions */}
        <div className="flex flex-wrap items-end gap-2 mb-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Month</label>
            <select
              className="input-sm"
              value={selMonth}
              onChange={(e) => { const m = Number(e.target.value); setSelMonth(m); loadMonth(m, selYear, payCurrency); }}
              disabled={loading || generating}
            >
              {MONTH_NAMES.map((nm, i) => <option key={i} value={i + 1}>{nm}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Year</label>
            <select
              className="input-sm"
              value={selYear}
              onChange={(e) => { const y = Number(e.target.value); setSelYear(y); loadMonth(selMonth, y, payCurrency); }}
              disabled={loading || generating}
            >
              {Array.from({ length: 5 }, (_, i) => _now.getFullYear() - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Currency</label>
            <select
              className="input-sm"
              value={payCurrency}
              onChange={(e) => { const c = e.target.value; setPayCurrency(c); loadMonth(selMonth, selYear, c); }}
              disabled={loading || generating}
            >
              {['CAD', 'USD', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1" />
          {salary?.paymentStatus && (
            <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-black border ${
              salary.paymentStatus === 'paid' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : salary.paymentStatus === 'partial' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
              {salary.paymentStatus}
            </span>
          )}
          <button className="btn sm bg-gray-800 text-white font-bold" onClick={generatePayslip} disabled={loading || generating}>
            {generating ? 'Generating…' : 'Generate Payslip'}
          </button>
          <button className="btn sm main-btn text-black font-bold" onClick={() => exportPDF()} disabled={loading || generating}>
            Export PDF
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Trips</p>
            <p className="text-xl font-black mt-1">{summary?.totalTrips || 0}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Miles</p>
            <p className="text-xl font-black mt-1">{fmtMilesKm(summary?.totalMiles || 0)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Trip Pay</p>
            <p className="text-xl font-black text-green-400 mt-1"><Currency amount={tripPay} currency={moneyCurrency} /></p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Deductions</p>
            <p className="text-xl font-black text-red-400 mt-1">-<Currency amount={totalDeductions} currency={moneyCurrency} /></p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Net Pay</p>
            <p className={`text-xl font-black mt-1 ${netPay >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
              <Currency amount={netPay} currency={moneyCurrency} />
            </p>
            {totalCityPay > 0 && (
              <p className="text-[10px] text-gray-500 mt-0.5">Incl. <Currency amount={totalCityPay} currency={moneyCurrency} /> city</p>
            )}
          </div>
        </div>

        {/* Rate badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1.5 rounded-xl text-[10px] uppercase font-black border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
            Solo <Currency amount={Number(summary?.soloRate ?? driver?.driverProfile?.ratePerMileSolo ?? driver?.driverProfile?.ratePerMile ?? 0)} currency={moneyCurrency} />/mi
          </span>
          <span className="px-3 py-1.5 rounded-xl text-[10px] uppercase font-black border border-yellow-500/30 text-yellow-300 bg-yellow-500/10">
            Team <Currency amount={Number(summary?.teamRate ?? driver?.driverProfile?.ratePerMileTeam ?? driver?.driverProfile?.ratePerMile ?? 0)} currency={moneyCurrency} />/mi
          </span>
          <span className="px-3 py-1.5 rounded-xl text-[10px] uppercase font-black border border-blue-500/30 text-blue-300 bg-blue-500/10">
            City <Currency amount={cityRate} currency={moneyCurrency} />/hr
          </span>
        </div>

        {/* ---- CITY HOURS (DB-saved) ---- */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold">City Hours</p>
              <p className="text-xs text-gray-400">Rate: <Currency amount={cityRate} currency={moneyCurrency} />/hr • Total: <Currency amount={totalCityPay} currency={moneyCurrency} /></p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="input-sm max-w-[160px]"
                value={newCityDate}
                onChange={(e) => setNewCityDate(e.target.value)}
              />
              <input
                className="input-sm max-w-[100px]"
                type="number"
                step="0.25"
                placeholder="Hours"
                value={newCityHours}
                onChange={(e) => setNewCityHours(e.target.value)}
              />
              <button
                className="btn rounded-xl py-2 px-4 bg-gray-700 text-white text-sm"
                onClick={addCityHour}
                disabled={savingCity}
              >
                {savingCity ? '…' : 'Add'}
              </button>
            </div>
          </div>

          {cityHours.length > 0 && (
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <div className="max-h-[160px] overflow-auto">
                <table className="min-w-[440px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 bg-gray-900 sticky top-0 text-xs">
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Hours</th>
                      <th className="px-3 py-2">Rate</th>
                      <th className="px-3 py-2 text-right">Pay</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityHours.map((c) => (
                      <tr key={c._id} className="border-t border-gray-800">
                        <td className="px-3 py-2 text-gray-300">{new Date(c.date).toLocaleDateString()}</td>
                        <td className="px-3 py-2">{Number(c.hours || 0).toFixed(2)} hrs</td>
                        <td className="px-3 py-2 text-gray-400"><Currency amount={Number(c.rate || 0)} currency={moneyCurrency} />/hr</td>
                        <td className="px-3 py-2 text-right text-green-400 font-bold"><Currency amount={Number(c.amount || 0)} currency={moneyCurrency} /></td>
                        <td className="px-3 py-2 text-right">
                          <button
                            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40"
                            onClick={() => removeCityHour(c._id)}
                            disabled={deletingId === c._id}
                          >
                            {deletingId === c._id ? '…' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ---- DEDUCTIONS ---- */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold">Deductions</p>
              <p className="text-xs text-red-400">Total: -<Currency amount={totalDeductions} currency={moneyCurrency} /></p>
            </div>
            {!showDeductForm && (
              <button
                className="btn sm bg-red-700 hover:bg-red-600 text-white text-xs"
                onClick={() => setShowDeductForm(true)}
              >
                + Add Deduction
              </button>
            )}
          </div>

          {showDeductForm && (
            <div className="bg-gray-800 rounded-xl p-3 mb-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Type</label>
                  <select
                    className="input-sm w-full"
                    value={deductForm.type}
                    onChange={(e) => setDeductForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {DEDUCTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Amount ({moneyCurrency})</label>
                  <input
                    type="number" min="0" step="0.01"
                    className="input-sm w-full"
                    placeholder="0.00"
                    value={deductForm.amount}
                    onChange={(e) => setDeductForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Date</label>
                  <input
                    type="date"
                    className="input-sm w-full"
                    value={deductForm.date}
                    onChange={(e) => setDeductForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Note</label>
                  <input
                    type="text"
                    className="input-sm w-full"
                    placeholder="Optional"
                    value={deductForm.description}
                    onChange={(e) => setDeductForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  className="btn sm bg-red-700 hover:bg-red-600 text-white"
                  onClick={addDeduction}
                  disabled={savingDeduct}
                >
                  {savingDeduct ? 'Saving…' : 'Save Deduction'}
                </button>
                <button
                  className="btn sm bg-gray-700 text-gray-300"
                  onClick={() => setShowDeductForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {deductionItems.length > 0 ? (
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <table className="min-w-[440px] w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 bg-gray-900 text-xs">
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Note</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deductionItems.map((d) => (
                    <tr key={d._id} className="border-t border-gray-800">
                      <td className="px-3 py-2 text-gray-300">{new Date(d.date).toLocaleDateString()}</td>
                      <td className="px-3 py-2 capitalize text-orange-300">{d.type.replace('_', ' ')}</td>
                      <td className="px-3 py-2 text-gray-400 max-w-[140px] truncate">{d.description || '—'}</td>
                      <td className="px-3 py-2 text-right text-red-400 font-bold">-<Currency amount={Number(d.amount || 0)} currency={moneyCurrency} /></td>
                      <td className="px-3 py-2 text-right">
                        <button
                          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40"
                          onClick={() => removeDeduction(d._id)}
                          disabled={deletingId === d._id}
                        >
                          {deletingId === d._id ? '…' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-gray-600">No deductions this period</p>
          )}
        </div>

        {/* ---- TRIPS TABLE ---- */}
        <div className="border border-gray-800 rounded-2xl overflow-hidden">
          <div className="max-h-[280px] sm:max-h-[320px] overflow-auto">
            <table className="min-w-[520px] w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-900 sticky top-0">
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Trips</th>
                  <th className="px-3 py-2">Miles</th>
                  <th className="px-3 py-2">KM</th>
                  <th className="px-3 py-2 text-right">Pay</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={idx} className="border-t border-gray-800">
                    <td className="px-3 py-2">
                      <Link className="text-blue-400 hover:text-blue-300" to={`/view/order/${o._id}`}>
                        {o.orderSerial ? `#CMC${o.orderSerial}` : String(o._id).slice(-6)}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${o.rateType === 'team' ? 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10' : 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'}`}>
                        {o.rateType || 'solo'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{o.trips}</td>
                    <td className="px-3 py-2">{fmtMilesKm(o.miles || 0)}</td>
                    <td className="px-3 py-2">{o.km.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right"><Currency amount={o.pay} currency={moneyCurrency} /></td>
                  </tr>
                ))}
                {orders.length === 0 && !loading && (
                  <tr><td className="px-3 py-10 text-gray-500" colSpan={6}>No trips in this range</td></tr>
                )}
                {loading && (
                  <tr><td className="px-3 py-10 text-gray-500" colSpan={6}>Loading…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- GENERATED PAYSLIPS (history) ---- */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-200">Generated Payslips</h3>
            <span className="text-[11px] text-gray-500">{history.length} total</span>
          </div>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-gray-500 bg-gray-900/60">
                  <th className="px-3 py-2">Period</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Trips</th>
                  <th className="px-3 py-2 text-right">Net Payable</th>
                  <th className="px-3 py-2 text-right">Due</th>
                  <th className="px-3 py-2 text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id} className="border-t border-gray-800">
                    <td className="px-3 py-2 font-semibold text-gray-200">{MONTH_NAMES[(h.month || 1) - 1]} {h.year}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border ${
                        h.paymentStatus === 'paid' ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                        : h.paymentStatus === 'partial' ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                        : 'border-gray-700 text-gray-300 bg-gray-800'}`}>
                        {h.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{h.totalTrips || 0}</td>
                    <td className="px-3 py-2 text-right font-semibold"><Currency amount={Number(h.finalPayable || 0)} currency={h.currency || 'USD'} noConvert /></td>
                    <td className="px-3 py-2 text-right text-gray-400"><Currency amount={Number(h.dueAmount || 0)} currency={h.currency || 'USD'} noConvert /></td>
                    <td className="px-3 py-2 text-right">
                      <button
                        className="text-[11px] font-bold text-[#a091ff] hover:underline disabled:opacity-50"
                        onClick={async () => { setDownloadingId(h._id); await exportPDF(h.month, h.year, h.currency); setDownloadingId(null); }}
                        disabled={downloadingId === h._id}
                      >
                        {downloadingId === h._id ? '…' : 'Download'}
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td className="px-3 py-8 text-center text-gray-500" colSpan={6}>No payslips generated yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Popup>
  );
}
