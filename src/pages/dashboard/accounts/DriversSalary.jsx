import React, { useContext, useEffect, useMemo, useState } from 'react';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import DriverEarningsPopup from '../../../components/drivers/DriverEarningsPopup';

export default function DriversSalary() {
  const { Errors } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [openPayslip, setOpenPayslip] = useState(false);

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
        <div className="w-full sm:w-[320px]">
          <input
            className="input-sm w-full"
            placeholder="Search driver (name, ID, email)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 bg-[#11131A] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-[1200px] w-full text-sm text-white">
            <thead className="bg-[#12161d] text-[#8A8FA3]">
              <tr>
                <th className="text-left px-4 py-3 font-bold">Driver</th>
                <th className="text-left px-4 py-3 font-bold">Corporate ID</th>
                <th className="text-left px-4 py-3 font-bold">Email</th>
                <th className="text-left px-4 py-3 font-bold">License Details</th>
                <th className="text-left px-4 py-3 font-bold">Province</th>
                <th className="text-left px-4 py-3 font-bold">Address</th>
                <th className="text-left px-4 py-3 font-bold">Rate/Mile</th>
                <th className="text-right px-4 py-3 font-bold">Action</th>
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
                  <tr key={d._id} className="border-t border-white/5">
                    <td className="px-4 py-3 font-semibold">{d?.name || '—'}</td>
                    <td className="px-4 py-3">{d?.corporateID || '—'}</td>
                    <td className="px-4 py-3">{d?.email || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">{d?.driverProfile?.licenseNumber || '—'}</span>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                          <span>{d?.driverProfile?.licenseIssueDate ? String(d.driverProfile.licenseIssueDate).slice(0, 10) : '—'}</span>
                          <span className="text-gray-600">→</span>
                          <span>{d?.driverProfile?.licenseExpiry ? String(d.driverProfile.licenseExpiry).slice(0, 10) : '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{d?.driverProfile?.licenseState || '—'}</td>
                    <td className="px-4 py-3 max-w-[360px] truncate">{d?.address || '—'}</td>
                    <td className="px-4 py-3">
                      {Number(d?.driverProfile?.ratePerMileSolo ?? d?.driverProfile?.ratePerMile ?? 0).toFixed(2)} /{' '}
                      {Number(d?.driverProfile?.ratePerMileTeam ?? d?.driverProfile?.ratePerMile ?? 0).toFixed(2)}
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
        }}
      />
    </AuthLayout>
  );
}
