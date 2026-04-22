import React, { useEffect, useState } from 'react';
import Popup from '../../pages/common/Popup';
import Api from '../../api/Api';
import { toast } from 'react-hot-toast';
import TimeFormat from '../../pages/common/TimeFormat';
import { Link } from 'react-router-dom';

export default function DriverEarningsPopup({ driver, open, onClose }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState('current');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [cityHours, setCityHours] = useState([]);
  const [newCityDate, setNewCityDate] = useState('');
  const [newCityHours, setNewCityHours] = useState('');

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
      setCityHours([]);
      setNewCityDate('');
      setNewCityHours('');
      fetchSummary(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cityRate = Number(driver?.driverProfile?.cityHoursRate || 0);
  const cityHoursTotal = cityHours.reduce((acc, x) => acc + Number(x.hours || 0), 0);
  const cityPay = cityHoursTotal * cityRate;
  const totalPayWithCity = Number(summary?.totalPay || 0) + cityPay;

  const addCityHour = () => {
    const hours = Number(newCityHours);
    const date = String(newCityDate || '').trim();
    if (!date) return toast.error('Please select a city date');
    if (!Number.isFinite(hours) || hours <= 0) return toast.error('Please enter valid city hours');
    setCityHours((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, date, hours }]);
    setNewCityHours('');
  };

  const updateCityHour = (id, patch) => {
    setCityHours((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const removeCityHour = (id) => {
    setCityHours((prev) => prev.filter((x) => x.id !== id));
  };

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
      const soloRate = Number(summary?.soloRate ?? driver?.driverProfile?.ratePerMileSolo ?? driver?.driverProfile?.ratePerMile ?? 0);
      const teamRate = Number(summary?.teamRate ?? driver?.driverProfile?.ratePerMileTeam ?? driver?.driverProfile?.ratePerMile ?? 0);
      doc.setFontSize(9);
      doc.text(`Rates: Solo $${soloRate.toFixed(2)}/mi • Team $${teamRate.toFixed(2)}/mi • City $${cityRate.toFixed(2)}/hr`, 14, 31);
      doc.setTextColor(17, 24, 39);
      doc.setFontSize(12);
      const s = summary || {};
      doc.text(`Total Trips: ${s.totalTrips || 0}`, 14, 44);
      doc.text(`Total Miles: ${(s.totalMiles || 0).toFixed(2)}`, 14, 52);
      doc.text(`Total KM: ${(s.totalKm || 0).toFixed(2)}`, 14, 60);
      doc.setTextColor(16, 185, 129);
      doc.text(`Total Pay: $${totalPayWithCity.toFixed(2)}`, 14, 68);
      if (cityHoursTotal > 0) {
        doc.setTextColor(17, 24, 39);
        doc.setFontSize(10);
        doc.text(`City Hours: ${cityHoursTotal.toFixed(2)}h • City Pay: $${cityPay.toFixed(2)}`, 14, 74);
      }
      doc.setTextColor(17, 24, 39);
      const rows = orders.map((o) => [
        o.orderSerial ? `CMC${o.orderSerial}` : String(o._id).slice(-6),
        o.rateType ? String(o.rateType).toUpperCase() : '',
        o.trips,
        o.miles.toFixed(2),
        o.km.toFixed(2),
        `$${o.pay.toFixed(2)}`
      ]);
      autoTable(doc, {
        startY: cityHoursTotal > 0 ? 80 : 76,
        head: [['Order', 'Type', 'Trips', 'Miles', 'KM', 'Pay']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [31, 41, 55], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 5: { halign: 'right' } }
      });

      if (cityHours.length > 0) {
        const startY = (doc.lastAutoTable?.finalY || 76) + 10;
        const cityRows = cityHours.map((c) => [c.date, String(Number(c.hours || 0).toFixed(2)), `$${(Number(c.hours || 0) * cityRate).toFixed(2)}`]);
        autoTable(doc, {
          startY,
          head: [['City Date', 'Hours', 'Pay']],
          body: cityRows,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [31, 41, 55], textColor: 255 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          columnStyles: { 2: { halign: 'right' } }
        });
      }

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
            <p className="text-xl font-black text-green-500 mt-1">${totalPayWithCity.toFixed(2)}</p>
            {cityHoursTotal > 0 && (
              <p className="text-[10px] text-gray-400 mt-1">Includes city hours: {cityHoursTotal.toFixed(2)}h</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-2 rounded-xl text-[10px] uppercase font-black border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
            Solo ${Number(summary?.soloRate ?? driver?.driverProfile?.ratePerMileSolo ?? driver?.driverProfile?.ratePerMile ?? 0).toFixed(2)}/mi
          </span>
          <span className="px-3 py-2 rounded-xl text-[10px] uppercase font-black border border-yellow-500/30 text-yellow-300 bg-yellow-500/10">
            Team ${Number(summary?.teamRate ?? driver?.driverProfile?.ratePerMileTeam ?? driver?.driverProfile?.ratePerMile ?? 0).toFixed(2)}/mi
          </span>
          <span className="px-3 py-2 rounded-xl text-[10px] uppercase font-black border border-blue-500/30 text-blue-300 bg-blue-500/10">
            City ${cityRate.toFixed(2)}/hr
          </span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="div">
              <p className="text-[10px] text-gray-500 uppercase font-bold">City Hours</p>
              <p className="text-xs text-gray-400 mt-1">Rate: ${cityRate.toFixed(2)}/hour</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                className="input-sm max-w-[200px]"
                value={newCityDate}
                onChange={(e) => setNewCityDate(e.target.value)}
                onInput={(e) => setNewCityDate(e.target.value)}
                onBlur={(e) => setNewCityDate(e.target.value)}
              />
              <input
                className="input-sm max-w-[140px]"
                type="number"
                step="0.25"
                placeholder="Hours"
                value={newCityHours}
                onChange={(e) => setNewCityHours(e.target.value)}
              />
              <button className="btn  rounded-2xl !py-4 px-6 bg-gray-800 text-white" onClick={addCityHour} disabled={loading}>
                Add
              </button>
            </div>
          </div>

          {cityHours.length > 0 && (
            <div className="mt-4 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="max-h-[180px] overflow-auto">
                <table className="min-w-[520px] w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 bg-gray-900 sticky top-0">
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Hours</th>
                      <th className="px-3 py-2 text-right">Pay</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cityHours.map((c) => (
                      <tr key={c.id} className="border-t border-gray-800">
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            className="input-sm"
                            value={c.date}
                            onChange={(e) => updateCityHour(c.id, { date: e.target.value })}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            className="input-sm"
                            type="number"
                            step="0.25"
                            value={c.hours}
                            onChange={(e) => updateCityHour(c.id, { hours: Number(e.target.value) || 0 })}
                          />
                        </td>
                        <td className="px-3 py-2 text-right text-green-400 font-bold">
                          ${(Number(c.hours || 0) * cityRate).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button className="btn xs bg-red-700 text-white" onClick={() => removeCityHour(c.id)}>
                            Remove
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

        <div className="border border-gray-800 rounded-2xl overflow-hidden">
          <div className="max-h-[280px] sm:max-h-[360px] overflow-auto">
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
                  <td className="px-3 py-2">{o.miles.toFixed(2)}</td>
                  <td className="px-3 py-2">{o.km.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">${o.pay.toFixed(2)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td className="px-3 py-10 text-gray-500" colSpan={6}>No trips in this range</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </Popup>
  );
}
