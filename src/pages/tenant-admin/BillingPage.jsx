import React, { useEffect, useMemo, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import AuthLayout from '../../layout/AuthLayout';
import Api from '../../api/Api';

const ACCENT = '#a091ff';
const CYCLES = [
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

const STATUS_META = {
  active: { label: 'Active', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  trial: { label: 'Trial', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  expired: { label: 'Expired', color: '#fb7185', bg: 'rgba(251,113,133,0.12)' },
  none: { label: 'No plan', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  cancelled: { label: 'Cancelled', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  past_due: { label: 'Past due', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
};

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
const fmtMoney = (n, cur = 'USD') => `${cur} ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const lim = (n) => (n && n > 0 ? n.toLocaleString() : '∞');

export default function BillingPage() {
  const [sub, setSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState('monthly');
  const [checkout, setCheckout] = useState(null); // { plan, cycle }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, h] = await Promise.all([
        Api.get('/api/tenant-admin/subscription'),
        Api.get('/api/tenant-admin/subscription/plans'),
        Api.get('/api/tenant-admin/subscription/history'),
      ]);
      setSub(s.data?.data?.subscription || null);
      setPlans(p.data?.data?.plans || []);
      setHistory(h.data?.data?.history || []);
    } catch (e) {
      toast.error('Could not load billing information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const status = sub?.status || 'none';
  const meta = STATUS_META[status] || STATUS_META.none;
  const needsPlan = !sub?.isActive; // none or expired

  const priceFor = (plan, c) => plan?.pricing?.find((x) => x.cycle === c) || { price: plan?.monthlyPrice || 0, currency: plan?.currency || 'USD', discountPct: 0 };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: ACCENT }} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="max-w-6xl mx-auto pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white font-mona">Billing & Subscription</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your plan, see usage, and review past payments.</p>
        </div>

        {/* Expired / no-plan alert */}
        {needsPlan && (
          <div
            className="rounded-2xl p-5 mb-6 flex items-start gap-4"
            style={{ background: status === 'expired' ? 'rgba(251,113,133,0.1)' : `${ACCENT}12`, border: `1px solid ${status === 'expired' ? 'rgba(251,113,133,0.4)' : `${ACCENT}40`}` }}
          >
            <div className="text-2xl">{status === 'expired' ? '⚠️' : '✨'}</div>
            <div>
              <h3 className="text-white font-semibold">
                {status === 'expired' ? 'Your subscription has expired' : 'No active subscription'}
              </h3>
              <p className="text-gray-300 text-sm mt-1">
                {status === 'expired'
                  ? 'Renew a plan below to restore order creation for your team.'
                  : 'Choose a plan below to unlock order creation and start operating.'}
              </p>
            </div>
          </div>
        )}

        {/* Current plan + usage */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mb-8">
          <div className="bg-dark1 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Current plan</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ color: meta.color, background: meta.bg }}>
                {meta.label}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-white font-mona">{sub?.planName || 'No plan'}</div>
                {sub?.monthlyPrice != null && status !== 'none' && (
                  <div className="text-main text-sm mt-1">{fmtMoney(sub.monthlyPrice, sub.currency)}/mo · {sub.billingCycle}</div>
                )}
              </div>
              <div className="text-right text-sm">
                {sub?.endDate && (
                  <>
                    <div className="text-gray-500">{status === 'expired' ? 'Expired on' : 'Renews on'}</div>
                    <div className="text-white">{fmtDate(sub.endDate)}</div>
                    {sub?.daysUntilRenewal != null && status === 'active' && (
                      <div className="text-xs text-gray-500 mt-0.5">{sub.daysUntilRenewal} days left</div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="mt-5">
              <button
                onClick={() => { const el = document.getElementById('plans'); el && el.scrollIntoView({ behavior: 'smooth' }); }}
                className="btn rounded-xl !py-2.5 !px-5"
              >
                {needsPlan ? 'Choose a plan' : 'Change or renew plan'}
              </button>
            </div>
          </div>

          {/* Usage */}
          <div className="bg-dark1 border border-gray-800 rounded-2xl p-6">
            <span className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Usage</span>
            {needsPlan ? (
              <div className="mt-6 flex flex-col items-center justify-center text-center py-6">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-3" style={{ background: `${ACCENT}14`, border: `1px solid ${ACCENT}33` }}>
                  <span className="text-lg" style={{ color: ACCENT }}>◷</span>
                </div>
                <p className="text-gray-300 text-sm font-medium">No active plan</p>
                <p className="text-gray-500 text-xs mt-1">Choose a plan to set your limits and start tracking usage.</p>
              </div>
            ) : (() => {
              const Bar = ({ k, label, sub: subLabel }) => {
                const u = sub?.usage?.[k] || { current: 0, limit: 0, percentage: null };
                const pctVal = u.percentage == null ? 0 : Math.min(100, u.percentage);
                const danger = u.percentage != null && u.percentage >= 90;
                return (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-300">{u.current} <span className="text-gray-600">/ {lim(u.limit)}</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pctVal}%`, background: danger ? '#fb7185' : ACCENT }} />
                    </div>
                    {subLabel && <div className="text-[11px] text-gray-500 mt-1">{subLabel}</div>}
                  </div>
                );
              };
              const resetDate = sub?.usage?.orders?.resetDate || sub?.orderResetDate;
              return (
                <div className="mt-4 space-y-5">
                  <Bar k="orders" label="Orders this month" sub={resetDate ? `Resets on ${fmtDate(resetDate)}` : null} />
                  <Bar k="users" label="Team members" sub="Total seats" />
                </div>
              );
            })()}
          </div>
        </div>

        {/* Plans */}
        <div id="plans" className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-white">Plans</h2>
          <div className="inline-flex p-1 rounded-xl bg-dark1 border border-gray-800">
            {CYCLES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCycle(c.key)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={cycle === c.key ? { background: ACCENT, color: '#000' } : { color: '#9ca3af' }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const pr = priceFor(plan, cycle);
            const isCurrent = sub?.planSlug === plan.slug && sub?.isActive;
            return (
              <div
                key={plan._id || plan.slug}
                className="bg-dark1 border rounded-2xl p-6 flex flex-col"
                style={{ borderColor: isCurrent ? ACCENT : 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                  {isCurrent && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: ACCENT, background: `${ACCENT}1a` }}>Current</span>}
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-white font-mona">{fmtMoney(pr.price, pr.currency)}</span>
                  <span className="text-gray-500 text-sm"> / {cycle === 'monthly' ? 'mo' : cycle === 'quarterly' ? '3 mo' : 'yr'}</span>
                  {pr.discountPct > 0 && (
                    <div className="text-xs text-emerald-400 mt-1">Save {pr.discountPct}% vs monthly</div>
                  )}
                </div>
                {plan.description && <p className="text-gray-400 text-sm mt-3">{plan.description}</p>}
                <ul className="mt-4 space-y-1.5 text-sm text-gray-300 flex-1">
                  <li>• <span className="text-white font-semibold">{lim(plan.limits?.maxOrders)}</span> orders / month</li>
                  <li>• {lim(plan.limits?.maxUsers)} team members</li>
                  <li>• Unlimited customers, carriers & fleet</li>
                  <li className="text-gray-500 pt-1">• Modules: {(plan.allowedModules || []).map((m) => (m === 'regular' ? 'Trucking' : 'Carriers')).join(', ') || '—'}</li>
                </ul>
                <button
                  onClick={() => setCheckout({ plan, cycle })}
                  className="mt-5 w-full rounded-xl py-2.5 font-semibold text-sm transition-colors"
                  style={isCurrent
                    ? { background: 'transparent', border: `1px solid ${ACCENT}`, color: ACCENT }
                    : { background: ACCENT, color: '#000' }}
                >
                  {isCurrent ? 'Renew' : needsPlan ? 'Buy plan' : 'Switch to this'}
                </button>
              </div>
            );
          })}
        </div>

        {/* History */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-4">Payment history</h2>
          {history.length === 0 ? (
            <div className="bg-dark1 border border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-sm">
              No payments yet.
            </div>
          ) : (
            <div className="bg-dark1 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-800">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Cycle</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium text-right">Amount</th>
                    <th className="px-5 py-3 font-medium">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h._id} className="border-b border-gray-800/60 last:border-0">
                      <td className="px-5 py-3 text-gray-300">{fmtDate(h.createdAt)}</td>
                      <td className="px-5 py-3 text-white">{h.planName}</td>
                      <td className="px-5 py-3 text-gray-400 capitalize">{h.billingCycle}</td>
                      <td className="px-5 py-3 text-gray-400 capitalize">{h.action}</td>
                      <td className="px-5 py-3 text-right text-gray-200">{fmtMoney(h.amount, h.currency)}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{fmtDate(h.startDate)} → {fmtDate(h.endDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {checkout && (
        <CheckoutModal
          plan={checkout.plan}
          cycle={checkout.cycle}
          price={priceFor(checkout.plan, checkout.cycle)}
          onClose={() => setCheckout(null)}
          onPaid={async () => { setCheckout(null); await load(); }}
        />
      )}
    </AuthLayout>
  );
}

// Mock checkout — dummy card form, no real gateway.
function CheckoutModal({ plan, cycle, price, onClose, onPaid }) {
  const [paying, setPaying] = useState(false);
  const [card, setCard] = useState({ number: '', exp: '', cvc: '', name: '' });

  const pay = async () => {
    setPaying(true);
    try {
      const res = await Api.post('/api/tenant-admin/subscription/checkout', { planSlug: plan.slug, billingCycle: cycle });
      if (res.data?.status) {
        toast.success(res.data.message || 'Payment successful');
        await onPaid();
      } else {
        toast.error(res.data?.message || 'Payment failed');
      }
    } catch (e) {
      const d = e.response?.data;
      toast.error((Array.isArray(d?.errors) && d.errors[0]) || d?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="w-full max-w-md bg-dark1 border border-gray-800 rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">Checkout</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5 p-4 rounded-xl" style={{ background: `${ACCENT}10` }}>
            <div>
              <div className="text-white font-semibold">{plan.name}</div>
              <div className="text-gray-400 text-sm capitalize">{cycle} billing</div>
            </div>
            <div className="text-2xl font-bold text-white font-mona">{fmtMoney(price.price, price.currency)}</div>
          </div>

          <div className="space-y-3">
            <input className="input-sm w-full" placeholder="Name on card" value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })} />
            <input className="input-sm w-full" placeholder="Card number  4242 4242 4242 4242" value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input-sm w-full" placeholder="MM / YY" value={card.exp}
                onChange={(e) => setCard({ ...card, exp: e.target.value })} />
              <input className="input-sm w-full" placeholder="CVC" value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
            </div>
          </div>

          <p className="text-[11px] text-gray-500 mt-3">Demo checkout — no real payment is processed.</p>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800">Cancel</button>
            <button onClick={pay} disabled={paying} className="flex-1 btn rounded-xl !py-2.5 disabled:opacity-50">
              {paying ? 'Processing…' : `Pay ${fmtMoney(price.price, price.currency)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
