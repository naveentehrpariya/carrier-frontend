import React, { useContext, useEffect, useMemo, useState } from 'react';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import DriverEarningsPopup from '../../../components/drivers/DriverEarningsPopup';
import Currency from '../../common/Currency';
import toast from 'react-hot-toast';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function DriversSalary() {
  const { Errors } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [openPayslip, setOpenPayslip] = useState(false);

  // Generated payslips of the selected period (shown above the driver list)
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [slips, setSlips] = useState([]);
  const [slipsLoading, setSlipsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchSlips = (m = month, y = year) => {
    setSlipsLoading(true);
    Api.get(`/driver/salaries/list?month=${m}&year=${y}`)
      .then((res) => setSlips(res.data.status ? res.data.lists || [] : []))
      .catch(() => setSlips([]))
      .finally(() => setSlipsLoading(false));
  };

  useEffect(() => {
    fetchSlips(month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const downloadSlipPdf = async (slip) => {
    try {
      setDownloadingId(slip._id);
      const qs = new URLSearchParams({ month: String(slip.month), year: String(slip.year) });
      if (slip.currency) qs.set('currency', slip.currency);
      const res = await Api.get(`/driver/${slip.driver?._id || slip.driver}/salary/pdf?${qs.toString()}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${slip.driver?.name || 'driver'}-${MONTHS[slip.month - 1]}-${slip.year}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Failed to download payslip PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const fetchDrivers = () => {
    setLoading(true);
    Api.get('/driver/listings')
      .then((res) => {
        if (res.data.status) setDrivers(res.data.lists || []);
        else setDrivers([]);
      })
      .catch((err) => {
        setDrivers([]);
        Errors && Errors(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return drivers;
    return (drivers || []).filter((d) => {
      const name = String(d?.name || '').toLowerCase();
      const id = String(d?.corporateID || '').toLowerCase();
      const email = String(d?.email || '').toLowerCase();
      return name.includes(q) || id.includes(q) || email.includes(q);
    });
  }, [drivers, search]);

  return (
    <AuthLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-white text-2xl font-bold">Drivers Salary</h2>
          <p className="text-xs text-gray-400 mt-1">Generate payslips using trips mileage and rate per mile</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <div className="flex gap-2.5">
            <select className="input-sm !mt-0 w-full sm:w-[130px]" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className="input-sm !mt-0 w-full sm:w-[92px]" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {Array.from({ length: 6 }, (_, i) => now.getFullYear() - 4 + i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <input
            className="input-sm !mt-0 w-full sm:w-[280px]"
            placeholder="Search driver (name, ID, email)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Generated payslips for the selected period */}
      <div className="mt-6 bg-[#11131A] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <h3 className="text-white font-bold text-sm">Generated Payslips — {MONTHS[month - 1]} {year}</h3>
          <span className="text-[11px] text-gray-500">{slips.length} total</span>
        </div>
        <div className="overflow-x-auto">
          {slipsLoading ? (
            <p className="px-4 py-6 text-center text-gray-400 text-sm">Loading…</p>
          ) : slips.length === 0 ? (
            <p className="px-4 py-6 text-center text-gray-500 text-sm">No payslips generated for {MONTHS[month - 1]} {year} yet — use "Generate Payslip" on a driver below.</p>
          ) : (
            <table className="w-full text-sm text-white">
              <thead className="bg-[#12161d] text-[#8A8FA3]">
                <tr>
                  <th className="text-left px-4 py-2.5 font-bold">Driver</th>
                  <th className="text-left px-4 py-2.5 font-bold">Status</th>
                  <th className="text-right px-4 py-2.5 font-bold">Trips</th>
                  <th className="text-right px-4 py-2.5 font-bold">Net Payable</th>
                  <th className="text-right px-4 py-2.5 font-bold">Paid</th>
                  <th className="text-right px-4 py-2.5 font-bold">Due</th>
                  <th className="text-right px-4 py-2.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {slips.map((s) => (
                  <tr key={s._id} className="border-t border-white/5">
                    <td className="px-4 py-2.5">
                      <button
                        className="text-left hover:text-main transition-colors"
                        onClick={() => {
                          const d = drivers.find((dr) => dr._id === (s.driver?._id || s.driver));
                          if (d) { setSelectedDriver(d); setOpenPayslip(true); }
                        }}
                        title="Open payslip details"
                      >
                        <span className="font-semibold">{s.driver?.name || '—'}</span>
                        <span className="block text-[11px] text-gray-500">{s.driver?.corporateID || ''}</span>
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        s.paymentStatus === 'paid' ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                        : s.paymentStatus === 'partial' ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
                        : 'border-gray-500/30 text-gray-300 bg-gray-500/10'}`}>
                        {s.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">{s.totalTrips ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right font-semibold"><Currency amount={Number(s.finalPayable || 0)} currency={s.currency || 'USD'} /></td>
                    <td className="px-4 py-2.5 text-right text-emerald-300"><Currency amount={Number(s.paidAmount || 0)} currency={s.currency || 'USD'} /></td>
                    <td className="px-4 py-2.5 text-right text-amber-300"><Currency amount={Number(s.dueAmount || 0)} currency={s.currency || 'USD'} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        className="text-main text-[12px] font-semibold hover:underline disabled:opacity-50"
                        disabled={downloadingId === s._id}
                        onClick={() => downloadSlipPdf(s)}
                      >
                        {downloadingId === s._id ? 'Downloading…' : 'Download PDF'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-6 bg-[#11131A] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-white table-fixed">
            <thead className="bg-[#12161d] text-[#8A8FA3]">
              <tr>
                <th className="text-left px-4 py-3 font-bold w-[24%]">Driver</th>
                <th className="text-left px-4 py-3 font-bold w-[22%]">License &amp; Province</th>
                <th className="text-left px-4 py-3 font-bold w-[26%]">Address</th>
                <th className="text-left px-4 py-3 font-bold w-[12%]">Rate/Mile</th>
                <th className="text-right px-4 py-3 font-bold w-[16%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-400" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-gray-400" colSpan={5}>
                    No drivers found
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((d) => (
                  <tr key={d._id} className="border-t border-white/5 align-top">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{d?.name || '—'}</span>
                        <span className="text-xs text-gray-400 mt-0.5">{d?.corporateID || '—'}</span>
                        <span className="text-xs text-gray-500 mt-0.5 truncate" title={d?.email || ''}>{d?.email || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">{d?.driverProfile?.licenseNumber || '—'}</span>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                          <span>{d?.driverProfile?.licenseIssueDate ? String(d.driverProfile.licenseIssueDate).slice(0, 10) : '—'}</span>
                          <span className="text-gray-600">→</span>
                          <span>{d?.driverProfile?.licenseExpiry ? String(d.driverProfile.licenseExpiry).slice(0, 10) : '—'}</span>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{d?.driverProfile?.licenseState || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 truncate" title={d?.address || ''}>{d?.address || '—'}</td>
                    {/* Rates are shown as agreed, in the driver's own pay currency — not converted to
                        the header currency, which would misrepresent the contracted rate. */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {Number(d?.driverProfile?.ratePerMileSolo ?? d?.driverProfile?.ratePerMile ?? 0).toFixed(2)} /{' '}
                      {Number(d?.driverProfile?.ratePerMileTeam ?? d?.driverProfile?.ratePerMile ?? 0).toFixed(2)}
                      <span className="ml-1.5 text-[10px] uppercase text-gray-500">{d?.driverProfile?.rateCurrency || 'USD'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="btn sm main-btn text-black font-bold"
                        onClick={() => {
                          setSelectedDriver(d);
                          setOpenPayslip(true);
                        }}
                      >
                        Generate Payslip
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <DriverEarningsPopup
        driver={selectedDriver}
        open={openPayslip}
        onClose={() => {
          setOpenPayslip(false);
          setSelectedDriver(null);
          fetchSlips(); // popup me payslip generate/update hua ho to list refresh
        }}
      />
    </AuthLayout>
  );
}
