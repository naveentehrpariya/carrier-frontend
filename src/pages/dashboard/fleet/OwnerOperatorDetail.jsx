import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import Loading from '../../common/Loading';
import TimeFormat from '../../common/TimeFormat';
import { getTruckLabel } from '../../../utils/truckLabel';

const fmtMoney = (amount, currency) => {
  const cur = String(currency || 'usd').toUpperCase();
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(n);
  } catch {
    return `${cur} ${n.toFixed(2)}`;
  }
};

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const StatCard = ({ label, value, accent = '#38bdf8' }) => (
  <div className="bg-dark4 border border-gray-900 rounded-2xl p-4">
    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.12em]">{label}</div>
    <div className="mt-1 text-xl font-bold font-mona" style={{ color: accent }}>{value}</div>
  </div>
);

const Section = ({ title, count, children }) => (
  <div className="mt-6 bg-[#11131A] border border-white/5 rounded-2xl overflow-hidden">
    <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 className="text-sm font-bold text-white uppercase tracking-[0.1em]">{title}</h3>
      {typeof count === 'number' && (
        <span className="text-xs text-gray-400 bg-white/5 rounded-lg px-2 py-1">{count} total</span>
      )}
    </div>
    {children}
  </div>
);

const statusPill = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'paid' || s === 'active' || s === 'completed' || s === 'delivered')
    return 'bg-green-500/20 text-green-300';
  if (s === 'partial' || s === 'in_transit' || s === 'added')
    return 'bg-amber-500/20 text-amber-300';
  return 'bg-gray-700 text-gray-300';
};

export default function OwnerOperatorDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [salaries, setSalaries] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [detailRes, finRes] = await Promise.all([
          Api.get(`/owner-operators/detail/${id}`),
          Api.get(`/owner-operators/financial/${id}`).catch(() => ({ data: {} })),
        ]);
        if (!active) return;
        if (detailRes.data?.status) {
          setOwner(detailRes.data.ownerOperator || null);
          setTrucks(detailRes.data.trucks || []);
          setOrders(detailRes.data.orders || []);
        }
        if (finRes.data?.status) {
          setSummary(finRes.data.summary || null);
          setSalaries(finRes.data.salaries || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const orderAmount = (o) => {
    const amt = Number(o.input_total_amount) > 0 ? o.input_total_amount : o.total_amount;
    const cur = Number(o.input_total_amount) > 0 ? o.input_currency : o.revenue_currency;
    return fmtMoney(amt, cur);
  };

  return (
    <AuthLayout>
      {loading ? <Loading /> : (
        <div className="text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-gray-400 text-xs">Owner Operator</div>
              <h2 className="text-2xl font-bold">{owner?.fullName || '—'}</h2>
              <div className="text-gray-400 text-sm mt-1">
                {owner?.ownerOperatorId ? `ID: ${owner.ownerOperatorId}` : ''}
                {owner?.companyName ? ` • ${owner.companyName}` : ''}
                {owner?.phone ? ` • ${owner.phone}` : ''}
                {owner?.email ? ` • ${owner.email}` : ''}
              </div>
            </div>
            <Link to="/owner-operators" className="btn bg-gray-800 text-white rounded-2xl px-4 py-2">Back</Link>
          </div>

          {!owner ? (
            <div className="mt-6 text-gray-400">Owner operator not found</div>
          ) : (
            <>
              {/* Financial summary */}
              {summary && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  <StatCard label="Settlements" value={fmtMoney(summary.totalSettlements)} accent="#34d399" />
                  <StatCard label="Owner Profit" value={fmtMoney(summary.totalOwnerProfit)} accent="#38bdf8" />
                  <StatCard label="Driver Deduction" value={fmtMoney(summary.totalDriverDeduction)} accent="#fb7185" />
                  <StatCard label="Salary Generated" value={fmtMoney(summary.totalSalaryGenerated)} accent="#a091ff" />
                  <StatCard label="Paid" value={fmtMoney(summary.totalPaid)} accent="#34d399" />
                  <StatCard label="Due" value={fmtMoney(summary.totalDue)} accent="#fbbf24" />
                </div>
              )}

              {/* Trucks */}
              <Section title="Trucks" count={trucks.length}>
                {trucks.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">No trucks linked</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {trucks.map((t) => (
                      <Link
                        key={t._id}
                        to={`/truck/detail/${t._id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-[#22d3ee]">{getTruckLabel(t)}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {t.plateNumber ? `Plate: ${t.plateNumber}` : ''}
                            {t.truckNumber ? ` • Truck No: ${t.truckNumber}` : ''}
                            {t.unitNumber ? ` • Unit: ${t.unitNumber}` : ''}
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">View →</span>
                      </Link>
                    ))}
                  </div>
                )}
              </Section>

              {/* Orders */}
              <Section title="Orders" count={orders.length}>
                {orders.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">No orders found</div>
                ) : (
                  <div className="overflow-auto">
                    <table className="min-w-[800px] w-full text-sm">
                      <thead className="bg-[#12161d] text-[#8A8FA3]">
                        <tr>
                          <th className="px-4 py-3 text-left">Order #</th>
                          <th className="px-4 py-3 text-left">Customer</th>
                          <th className="px-4 py-3 text-left">Truck</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3 text-right">Settle</th>
                          <th className="px-4 py-3 text-right">Owner Profit</th>
                          <th className="px-4 py-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o._id} className="border-t border-white/5 hover:bg-white/[0.03]">
                            <td className="px-4 py-3">
                              <Link to={`/order/detail/${o._id}`} className="text-[#38bdf8] hover:underline font-semibold">
                                #{o.serial_no}
                              </Link>
                            </td>
                            <td className="px-4 py-3">{o.customer?.name || o.customer?.company_name || '—'}</td>
                            <td className="px-4 py-3 text-gray-300">{o.truck ? getTruckLabel(o.truck) : '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-lg ${statusPill(o.order_status)}`}>{o.order_status || '—'}</span>
                            </td>
                            <td className="px-4 py-3 text-right">{orderAmount(o)}</td>
                            <td className="px-4 py-3 text-right">{fmtMoney(o.settle_amount, o.revenue_currency)}</td>
                            <td className="px-4 py-3 text-right text-emerald-300">{fmtMoney(o.owner_profit, o.revenue_currency)}</td>
                            <td className="px-4 py-3 text-gray-400"><TimeFormat date={o.createdAt} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>

              {/* Pay slips / statements */}
              <Section title="Pay Slips / Statements" count={salaries.length}>
                {salaries.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">No pay slips generated</div>
                ) : (
                  <div className="overflow-auto">
                    <table className="min-w-[700px] w-full text-sm">
                      <thead className="bg-[#12161d] text-[#8A8FA3]">
                        <tr>
                          <th className="px-4 py-3 text-left">Period</th>
                          <th className="px-4 py-3 text-right">Final Payable</th>
                          <th className="px-4 py-3 text-right">Paid</th>
                          <th className="px-4 py-3 text-right">Due</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaries.map((s) => (
                          <tr key={s._id} className="border-t border-white/5 hover:bg-white/[0.03]">
                            <td className="px-4 py-3 font-semibold">{MONTHS[s.month] || s.month} {s.year}</td>
                            <td className="px-4 py-3 text-right">{fmtMoney(s.finalPayable, s.currency)}</td>
                            <td className="px-4 py-3 text-right text-emerald-300">{fmtMoney(s.paidAmount, s.currency)}</td>
                            <td className="px-4 py-3 text-right text-amber-300">{fmtMoney(s.dueAmount, s.currency)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-lg ${statusPill(s.paymentStatus)}`}>{s.paymentStatus || 'pending'}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link to={`/accounts/owner-operator-statement/${s._id}`} className="btn xs bg-[#1f2937] text-white">View Slip</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
