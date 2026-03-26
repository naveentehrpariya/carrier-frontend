import React, { useEffect, useState } from 'react';
import Popup from '../../pages/common/Popup';
import Api from '../../api/Api';
import { toast } from 'react-hot-toast';
import TimeFormat from '../../pages/common/TimeFormat';

export default function DriverEarningsPopup({ driver, open, onClose }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState('current');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

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

  const fetchSummary = async (override = {}) => {
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
    } catch (e) {
      toast.error('Failed to load earnings');
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
      fetchSummary(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      doc.setFillColor(20, 24, 32);
      doc.rect(0, 0, 210, 32, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(`DRIVER PAYSLIP`, 14, 14);
      doc.setFontSize(11);
      doc.text(`${driver?.name || ''} • ${driver?.corporateID || ''}`, 14, 22);
      if (from || to) {
        doc.setFontSize(10);
        doc.text(`Range: ${from || '—'} to ${to || '—'}`, 14, 28);
      }
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(12);
      const s = summary || {};
      doc.text(`Total Trips: ${s.totalTrips || 0}`, 14, 44);
      doc.text(`Total Miles: ${(s.totalMiles || 0).toFixed(2)}`, 14, 52);
      doc.text(`Total KM: ${(s.totalKm || 0).toFixed(2)}`, 14, 60);
      doc.setTextColor(16, 185, 129);
      doc.text(`Total Pay: $${(s.totalPay || 0).toFixed(2)}`, 14, 68);
      doc.setTextColor(17, 24, 39);
      const rows = orders.map((o) => [String(o._id).slice(-6), o.trips, o.miles.toFixed(2), o.km.toFixed(2), `$${o.pay.toFixed(2)}`]);
      autoTable(doc, {
        startY: 76,
        head: [['Order', 'Trips', 'Miles', 'KM', 'Pay']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [31, 41, 55], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 4: { halign: 'right' } }
      });
      doc.save(`payslip-${driver?.name || 'driver'}.pdf`);
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const quickSelect = async (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'current') {
      const r = monthRange(0);
      setFrom(r.from);
      setTo(r.to);
      await fetchSummary(r);
      return;
    }
    if (nextMode === 'previous') {
      const r = monthRange(-1);
      setFrom(r.from);
      setTo(r.to);
      await fetchSummary(r);
      return;
    }
  };

  return (
    <Popup open={open} onClose={onClose} showTrigger={false} size="md:max-w-3xl" bg="bg-black" space="p-4 sm:p-6">
      <div className="text-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">Driver Earnings</h2>
            <p className="text-xs text-gray-400 truncate">{driver?.name} • ID: {driver?.corporateID || '—'} • <TimeFormat date={new Date()} time={false} /></p>
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
          <div className="flex-1"></div>
          <button className="btn sm main-btn text-black font-bold" onClick={exportPDF} disabled={loading}>Export Payslip PDF</button>
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
              <button className="btn bg-gray-800 text-white w-full" onClick={() => fetchSummary()} disabled={loading}>
                {loading ? 'Loading…' : 'Apply'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Trips</p>
            <p className="text-xl font-black mt-1">{summary?.totalTrips || 0}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Miles</p>
            <p className="text-xl font-black mt-1">{Number(summary?.totalMiles || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">KM</p>
            <p className="text-xl font-black mt-1">{Number(summary?.totalKm || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Total Pay</p>
            <p className="text-xl font-black text-green-500 mt-1">${Number(summary?.totalPay || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="border border-gray-800 rounded-2xl overflow-hidden">
          <div className="max-h-[280px] sm:max-h-[360px] overflow-auto">
            <table className="min-w-[520px] w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 bg-gray-900 sticky top-0">
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Trips</th>
                <th className="px-3 py-2">Miles</th>
                <th className="px-3 py-2">KM</th>
                <th className="px-3 py-2 text-right">Pay</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => (
                <tr key={idx} className="border-t border-gray-800">
                  <td className="px-3 py-2">{String(o._id).slice(-6)}</td>
                  <td className="px-3 py-2">{o.trips}</td>
                  <td className="px-3 py-2">{o.miles.toFixed(2)}</td>
                  <td className="px-3 py-2">{o.km.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">${o.pay.toFixed(2)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td className="px-3 py-10 text-gray-500" colSpan={5}>No trips in this range</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </Popup>
  );
}
