import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';
import Api from '../api/Api';

const ACCENT = '#a091ff';

/**
 * App-wide alert shown when the tenant has no active subscription (none/expired).
 * Appears on every authenticated page (dashboard, orders, etc). The copy adapts to
 * the order-create page. Admins get a billing CTA; staff are told to contact admin.
 */
export default function SubscriptionBanner() {
  const { user } = useAuth();
  const location = useLocation();
  const [state, setState] = useState(null);

  useEffect(() => {
    let active = true;
    Api.get('/subscription/status')
      .then((res) => { if (active) setState(res.data?.data || null); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!state || state.active) return null;

  const isAdmin = user?.is_admin === 1 || Number(user?.role) === 3;
  const expired = state.subStatus === 'expired';
  const onOrderCreate = location.pathname === '/order/add';

  const title = expired ? 'Your plan has expired' : 'No active subscription';

  let message;
  if (onOrderCreate) {
    message = isAdmin
      ? 'You can’t create new orders while your plan is inactive. Please upgrade a plan first to start creating orders.'
      : 'New orders are blocked because billing is inactive. Please contact your administrator to upgrade the plan.';
  } else {
    message = isAdmin
      ? 'Order creation is locked across your company. Upgrade a plan to continue operating.'
      : 'Order creation is locked — billing is inactive. Please contact your administrator.';
  }

  const cta = expired ? 'Renew plan' : 'Choose a plan';

  const Inner = (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap transition-colors"
      style={{ background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.45)' }}
    >
      <span className="text-2xl leading-none">{expired ? '⚠️' : '✨'}</span>
      <div className="flex-1 min-w-[220px]">
        <p className="text-white text-sm font-bold">{title}</p>
        <p className="text-gray-300 text-xs mt-0.5">{message}</p>
      </div>
      {isAdmin && (
        <span
          className="text-sm font-bold px-4 py-2 rounded-xl shrink-0"
          style={{ background: ACCENT, color: '#000' }}
        >
          {cta} →
        </span>
      )}
    </div>
  );

  // Whole banner is a link to billing for admins; static notice for staff.
  return (
    <div className="mb-5">
      {isAdmin ? <Link to="/billing" className="block">{Inner}</Link> : Inner}
    </div>
  );
}
