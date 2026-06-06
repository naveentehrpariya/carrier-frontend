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

function monthRange(shift = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + shift, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + shift + 1, 0);
  return { from: toISODate(start), to: toISODate(end) };
}

function fmtMilesKm(value) {
  const miles = Number(value || 0);
  const km = miles * 1.60934;
  return `${miles.toFixed(2)} mi (${km.toFixed(2)} km)`;
}

export default function DriverEarningsPopup({ driver, open, onClose }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState('current');
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

  useEffect(() => {
    if (open) {
      const r = monthRange(0);
      setMode('current');
      setFrom(r.from);
      setTo(r.to);
      setNewCityDate('');
      setNewCityHours('');
      setShowDeductForm(false);
      fetchSummary(r);
      fetchDeductions(r);
    }
  }, [open, driver?._id]);

  const quickSelect = async (nextMode) => {
    setMode(nextMode);
    let r;
    if (nextMode === 'current') r = monthRange(0);
    else if (nextMode === 'previous') r = monthRange(-1);
    else return;
    setFrom(r.from);
    setTo(r.to);
    await Promise.all([fetchSummary(r), fetchDeductions(r)]);
  };

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
        await fetchDeductions({ from, to });
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
      await fetchDeductions({ from, to });
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
        await fetchDeductions({ from, to });
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
      await fetchDeductions({ from, to });
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
  const moneyCurrency = String(summary?.currency || 'CAD').toUpperCase();

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      doc.setFillColor(20, 24, 32);
      doc.rect(0, 0, 210, 34, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('DRIVER PAYSLIP', 14, 13);
      doc.setFontSize(11);
      doc.text(`${driver?.name || ''} • ${driver?.corporateID || ''}`, 14, 22);
      if (from || to) {
        doc.setFontSize(9);
        doc.text(`Range: ${from || '—'} to ${to || '—'}`, 14, 29);
      }
      const soloRate = Number(summary?.soloRate ?? driver?.driverProfile?.ratePerMileSolo ?? driver?.driverProfile?.ratePerMile ?? 0);
      const teamRate = Number(summary?.teamRate ?? driver?.driverProfile?.ratePerMileTeam ?? driver?.driverProfile?.ratePerMile ?? 0);
      doc.setFontSize(8);
      doc.text(`Rates: Solo $${soloRate.toFixed(2)}/mi  Team $${teamRate.toFixed(2)}/mi  City $${cityRate.toFixed(2)}/hr`, 14, 33);
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(11);
      const s = summary || {};
      doc.text(`Total Trips: ${s.totalTrips || 0}`, 14, 46);
      doc.text(`Total Miles: ${fmtMilesKm(s.totalMiles || 0)}`, 14, 53);
      doc.text(`Mileage Pay: $${tripPay.toFixed(2)}`, 14, 60);
      if (totalCityPay > 0) doc.text(`City Pay: $${totalCityPay.toFixed(2)}`, 14, 67);
      if (totalDeductions > 0) {
        doc.setTextColor(220, 38, 38);
        doc.text(`Deductions: -$${totalDeductions.toFixed(2)}`, 14, totalCityPay > 0 ? 74 : 67);
        doc.setTextColor(17, 24, 39);
      }
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(13);
      doc.text(`NET PAY: $${netPay.toFixed(2)}`, 14, totalDeductions > 0 ? 84 : (totalCityPay > 0 ? 77 : 70));
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(11);

      // Trips table
      const rows = orders.map((o) => [
        o.orderSerial ? `CMC${o.orderSerial}` : String(o._id).slice(-6),
        o.rateType ? String(o.rateType).toUpperCase() : 'SOLO',
        o.trips,
        o.miles.toFixed(2),
        o.km.toFixed(2),
        `$${o.pay.toFixed(2)}`
      ]);
      autoTable(doc, {
        startY: 96,
        head: [['Order', 'Type', 'Trips', 'Miles', 'KM', 'Pay']],
        body: rows,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [31, 41, 55], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 5: { halign: 'right' } }
      });

      let nextY = (doc.lastAutoTable?.finalY || 96) + 8;

      // City hours table
      if (cityHours.length > 0) {
        const cityRows = cityHours.map((c) => [
          new Date(c.date).toLocaleDateString(),
          `${Number(c.hours || 0).toFixed(2)} hrs`,
          `$${Number(c.rate || 0).toFixed(2)}/hr`,
          `$${Number(c.amount || 0).toFixed(2)}`
        ]);
        doc.setFontSize(10);
        doc.text('City Hours', 14, nextY + 4);
        autoTable(doc, {
          startY: nextY + 8,
          head: [['Date', 'Hours', 'Rate', 'Pay']],
          body: cityRows,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [31, 41, 55], textColor: 255 },
          columnStyles: { 3: { halign: 'right' } }
        });
        nextY = (doc.lastAutoTable?.finalY || nextY) + 8;
      }

      // Deductions table
      if (deductionItems.length > 0) {
        const dedRows = deductionItems.map((d) => [
          new Date(d.date).toLocaleDateString(),
          d.type.replace('_', ' ').toUpperCase(),
          d.description || '—',
          `-$${Number(d.amount || 0).toFixed(2)}`
        ]);
        doc.setFontSize(10);
        doc.text('Deductions', 14, nextY + 4);
        autoTable(doc, {
          startY: nextY + 8,
          head: [['Date', 'Type', 'Description', 'Amount']],
          body: dedRows,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [127, 29, 29], textColor: 255 },
          columnStyles: { 3: { halign: 'right', textColor: [220, 38, 38] } }
        });
      }

      doc.save(`payslip-${driver?.name || 'driver'}.pdf`);
    } catch {
      toast.error('Failed to generate PDF');
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

        {/* Date range */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['current', 'previous', 'custom'].map((m) => (
            <button
              key={m}
              className={`px-3 py-2 rounded-xl text-[10px] uppercase font-black border ${mode === m ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-gray-900 border-gray-800 text-gray-300'}`}
              onClick={() => quickSelect(m)}
              disabled={loading}
            >
              {m === 'current' ? 'This Month' : m === 'previous' ? 'Last Month' : 'Custom'}
            </button>
          ))}
          <div className="flex-1" />
          <button className="btn sm main-btn text-black font-bold" onClick={exportPDF} disabled={loading}>
            Export PDF
          </button>
        </div>

        {mode === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">From</label>
              <input type="date" className="input-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">To</label>
              <input type="date" className="input-sm" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button
                className="btn bg-gray-800 text-white w-full"
                onClick={() => { fetchSummary({ from, to }); fetchDeductions({ from, to }); }}
                disabled={loading}
              >
                Apply
              </button>
            </div>
          </div>
        )}

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
      </div>
    </Popup>
  );
}
