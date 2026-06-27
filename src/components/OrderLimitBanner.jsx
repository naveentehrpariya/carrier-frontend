import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';
import Api from '../api/Api';

const ACCENT = '#a091ff';
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');

/**
 * Shown on the Add Order page. Surfaces the MONTHLY order quota: how many of the plan's
 * monthly orders are used, when it resets, and a hard block message once it's exceeded.
 * (Subscription-inactive is handled separately by SubscriptionBanner.)
 */
export default function OrderLimitBanner() {
  const { user } = useAuth();
  const [o, setO] = useState(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    let on = true;
    Api.get('/subscription/status')
      .then((res) => { if (on) { setO(res.data?.data?.orders || null); setActive(res.data?.data?.active !== false); } })
      .catch(() => {});
    return () => { on = false; };
  }, []);

  // Inactive subscription is covered by the global banner; unlimited or no data → nothing here.
  if (!o || o.unlimited || !active) return null;

  const isAdmin = user?.is_admin === 1 || Number(user?.role) === 3;
  const exceeded = o.exceeded;
  const low = !exceeded && o.remaining != null && o.remaining <= Math.max(1, Math.ceil(o.limit * 0.1));

  if (!exceeded && !low) {
    // Quiet usage note.
    return (
      <div className="mb-5 text-xs text-gray-500">
        {o.used} of {o.limit} monthly orders used · resets {fmtDate(o.resetDate)}
      </div>
    );
  }

  const danger = exceeded;
  return (
    <div
      className="mb-6 rounded-2xl px-5 py-4 flex items-start gap-3 flex-wrap"
      style={{
        background: danger ? 'rgba(251,113,133,0.1)' : 'rgba(251,191,36,0.1)',
        border: `1px solid ${danger ? 'rgba(251,113,133,0.45)' : 'rgba(251,191,36,0.45)'}`,
      }}
    >
      <span className="text-lg">{danger ? '⛔' : '⚠️'}</span>
      <div className="flex-1 min-w-[220px]">
        <p className="text-white text-sm font-semibold">
          {danger
            ? `Monthly order limit reached (${o.used}/${o.limit})`
            : `Almost at your monthly order limit (${o.used}/${o.limit})`}
        </p>
        <p className="text-gray-300 text-xs mt-0.5">
          {danger
            ? `New orders are blocked until the quota resets on ${fmtDate(o.resetDate)}.`
            : `${o.remaining} order${o.remaining === 1 ? '' : 's'} left this month · resets ${fmtDate(o.resetDate)}.`}
          {danger && !isAdmin && ' Please contact your administrator to upgrade the plan.'}
        </p>
      </div>
      {danger && isAdmin && (
        <Link to="/billing" className="text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: ACCENT, color: '#000' }}>
          Upgrade plan
        </Link>
      )}
    </div>
  );
}
