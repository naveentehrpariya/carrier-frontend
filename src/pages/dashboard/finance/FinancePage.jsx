import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import { useAuth } from '../../../context/MultiTenantAuthProvider';

const PERIODS = [
  { label: '30D', value: '30d', full: '30 Days' },
  { label: '60D', value: '60d', full: '60 Days' },
  { label: '90D', value: '90d', full: '90 Days' },
  { label: '6M', value: '6m', full: '6 Months' },
  { label: '1Y', value: '1y', full: '1 Year' },
  { label: 'Custom', value: 'custom', full: 'Custom Range' },
];

const fmtFull = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(n || 0));

const pct = (n) => `${Number(n || 0).toFixed(1)}%`;

const routeFromShipping = (shipping) => {
  const blocks = Array.isArray(shipping) ? shipping : [];
  const locs = blocks.flatMap((b) => (Array.isArray(b?.locations) ? b.locations : []));
  const pickup = locs.find((l) => String(l?.type || '').toLowerCase() === 'pickup') || locs[0];
  const delivery =
    [...locs].reverse().find((l) => String(l?.type || '').toLowerCase() === 'delivery') ||
    locs[locs.length - 1];
  const from = (pickup?.city || pickup?.location || pickup?.address || '').trim();
  const to = (delivery?.city || delivery?.location || delivery?.address || '').trim();
  return { from: from || '—', to: to || '—' };
};

const shortDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
};

function StatusPill({ status }) {
  const s = String(status || '').toLowerCase();
  const cfg =
    s === 'paid'
      ? { dot: '#00E599', label: 'PAID', bg: 'rgba(0,229,153,0.08)', border: 'rgba(0,229,153,0.22)', color: '#00E599' }
      : s === 'partial'
      ? { dot: '#FFB800', label: 'PARTIAL', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.22)', color: '#FFB800' }
      : { dot: '#FF3B5C', label: 'PENDING', bg: 'rgba(255,59,92,0.08)', border: 'rgba(255,59,92,0.22)', color: '#FF3B5C' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        fontSize: 10,
        fontWeight: 700,
        color: cfg.color,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: cfg.dot,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

.fr-page {
  font-family: 'DM Sans', sans-serif;
  background: #07080D;
  min-height: 100%;
  position: relative;
}
.fr-grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px);
  background-size: 44px 44px;
  pointer-events: none;
  z-index: 0;
}
.fr-header {
  border-bottom: 1px solid rgba(255,255,255,0.055);
  padding: 22px 28px 0;
  background: linear-gradient(to bottom, rgba(0,212,255,0.018), transparent);
  position: relative;
  z-index: 1;
}
.fr-body {
  padding: 24px 28px;
  position: relative;
  z-index: 1;
}
.fr-title {
  font-family: 'Syne', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.03em;
  line-height: 1;
}
.fr-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.28);
  letter-spacing: 0.04em;
  margin-top: 5px;
}
.fr-pulse {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00D4FF;
  animation: frPulse 1.4s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes frPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.25; transform: scale(0.65); }
}
.fr-controls {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 0;
  flex-wrap: wrap;
  margin-top: 18px;
  margin-bottom: 1px;
}
.fr-vdiv {
  width: 1px;
  height: 26px;
  background: rgba(255,255,255,0.08);
  flex-shrink: 0;
}
.fr-module-wrap {
  display: flex;
  background: rgba(255,255,255,0.035);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
}
.fr-mod-btn {
  padding: 7px 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 7px;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255,255,255,0.3);
  transition: color 0.18s, background 0.18s, border-color 0.18s;
  font-family: 'DM Sans', sans-serif;
}
.fr-mod-btn.active {
  color: #fff;
  background: linear-gradient(135deg, rgba(0,212,255,0.14), rgba(167,139,250,0.14));
  border-color: rgba(0,212,255,0.22);
}
.fr-period-wrap {
  display: flex;
  gap: 1px;
}
.fr-per-btn {
  padding: 6px 13px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255,255,255,0.28);
  transition: all 0.15s;
  font-family: 'JetBrains Mono', monospace;
}
.fr-per-btn:hover { color: rgba(255,255,255,0.55); }
.fr-per-btn.active {
  color: #00D4FF;
  border-color: rgba(0,212,255,0.28);
  background: rgba(0,212,255,0.07);
}
.fr-date-input {
  height: 32px;
  padding: 0 11px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  border-radius: 6px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.65);
  outline: none;
  color-scheme: dark;
  transition: border-color 0.15s;
}
.fr-date-input:focus { border-color: rgba(0,212,255,0.38); }
.fr-apply-btn {
  height: 32px;
  padding: 0 15px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  border-radius: 6px;
  border: 1px solid rgba(0,212,255,0.28);
  background: rgba(0,212,255,0.07);
  color: #00D4FF;
  cursor: pointer;
  transition: all 0.18s;
}
.fr-apply-btn:hover { background: rgba(0,212,255,0.14); }
.fr-export-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid rgba(0,229,153,0.28);
  background: rgba(0,229,153,0.07);
  color: #00E599;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.18s;
  white-space: nowrap;
}
.fr-export-btn:hover:not(:disabled) {
  background: rgba(0,229,153,0.13);
  border-color: rgba(0,229,153,0.44);
}
.fr-export-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.fr-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 10px;
  margin-bottom: 22px;
}
.fr-card {
  position: relative;
  background: rgba(255,255,255,0.022);
  border: 1px solid rgba(255,255,255,0.058);
  border-radius: 11px;
  padding: 16px 18px;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}
.fr-card:hover {
  background: rgba(255,255,255,0.038);
  border-color: rgba(255,255,255,0.1);
}
.fr-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--fr-accent, #00D4FF);
}
.fr-card-glow {
  position: absolute;
  top: -16px; left: -16px;
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--fr-accent, #00D4FF);
  opacity: 0.045;
  filter: blur(18px);
  pointer-events: none;
}
.fr-card-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
  margin-bottom: 8px;
  font-family: 'DM Sans', sans-serif;
}
.fr-card-value {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 15px;
  line-height: 1.2;
}
.fr-card-sub {
  font-size: 10px;
  color: rgba(255,255,255,0.28);
  margin-top: 4px;
  font-family: 'DM Sans', sans-serif;
}
.fr-skeleton {
  border-radius: 11px;
  background: rgba(255,255,255,0.022);
  border: 1px solid rgba(255,255,255,0.05);
  animation: frPulse 1.5s ease-in-out infinite;
}
.fr-table-wrap {
  border: 1px solid rgba(255,255,255,0.065);
  border-radius: 12px;
  overflow: hidden;
  overflow-x: auto;
}
.fr-table-wrap::-webkit-scrollbar { height: 4px; }
.fr-table-wrap::-webkit-scrollbar-track { background: transparent; }
.fr-table-wrap::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}
.fr-tbl {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
  font-size: 12.5px;
}
.fr-tbl thead tr {
  background: rgba(0,0,0,0.38);
  border-bottom: 1px solid rgba(255,255,255,0.065);
}
.fr-tbl thead th {
  padding: 11px 15px;
  text-align: left;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
  white-space: nowrap;
}
.fr-tbl thead th.r { text-align: right; }
.fr-tbl thead th.c { text-align: center; }
.fr-tbl tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.038);
  transition: background 0.12s;
}
.fr-tbl tbody tr:hover { background: rgba(0,212,255,0.025); }
.fr-tbl tbody tr:last-child { border-bottom: none; }
.fr-tbl tbody td {
  padding: 11px 15px;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
}
.fr-tbl tbody td.r { text-align: right; }
.fr-tbl tbody td.c { text-align: center; }
.fr-tbl tfoot tr {
  background: rgba(0,0,0,0.42);
  border-top: 1px solid rgba(255,255,255,0.09);
}
.fr-tbl tfoot td { padding: 12px 15px; white-space: nowrap; }
.fr-tbl tfoot td.r { text-align: right; }
.fr-mono { font-family: 'JetBrains Mono', monospace !important; }
.fr-num { font-family: 'JetBrains Mono', monospace !important; font-weight: 600; }
.fr-cyan { color: #00D4FF !important; }
.fr-green { color: #00E599 !important; }
.fr-red { color: #FF3B5C !important; }
.fr-amber { color: #FFB800 !important; }
.fr-purple { color: #A78BFA !important; }
.fr-dim { color: rgba(255,255,255,0.3) !important; font-size: 11px; }
.fr-empty {
  padding: 64px 20px;
  text-align: center;
  border: 1px solid rgba(255,255,255,0.055);
  border-radius: 12px;
  color: rgba(255,255,255,0.18);
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.fr-link {
  text-decoration: none;
  color: inherit;
  transition: opacity 0.15s;
}
.fr-link:hover { opacity: 0.72; text-decoration: underline; text-underline-offset: 2px; text-decoration-color: rgba(255,255,255,0.25); }
.fr-type-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-family: 'DM Sans', sans-serif;
}
`;

export default function FinancePage() {
  const { Errors, company } = useContext(UserContext);
  const { activeModule } = useAuth();

  const [type, setType] = useState(activeModule === 'regular' ? 'regular' : 'outsourcing');
  const [period, setPeriod] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const currency = company?.currency || 'USD';

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setData(null);
    try {
      const qs = new URLSearchParams({ type, period });
      if (period === 'custom') {
        if (startDate) qs.set('startDate', startDate);
        if (endDate) qs.set('endDate', endDate);
      }
      const res = await Api.get(`/api/tenant-admin/finance/report?${qs.toString()}`);
      if (res.data?.status) setData(res.data.data);
    } catch (err) {
      Errors(err);
    } finally {
      setLoading(false);
    }
  }, [type, period, startDate, endDate, Errors]);

  useEffect(() => {
    if (period === 'custom' && (!startDate || !endDate)) return;
    fetchReport();
  }, [fetchReport]);

  const handleExportPdf = async () => {
    setExporting(true);
    setExportMsg('');
    try {
      const qs = new URLSearchParams({ type, period });
      if (period === 'custom') {
        if (startDate) qs.set('startDate', startDate);
        if (endDate) qs.set('endDate', endDate);
      }
      const res = await Api.get(`/api/tenant-admin/finance/report/pdf?${qs.toString()}`, {
        responseType: 'blob',
      });
      const rawBlob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const buf = await rawBlob.arrayBuffer();
      const header = new TextDecoder('ascii').decode(buf.slice(0, 5));
      if (header !== '%PDF-') {
        const text = new TextDecoder('utf-8').decode(buf.slice(0, 500));
        throw new Error(text || 'Invalid PDF');
      }
      const blob = new Blob([buf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const periodLabel = PERIODS.find((p) => p.value === period)?.full || period;
      link.download = `Finance_Report_${type}_${periodLabel.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportMsg('ok');
      setTimeout(() => setExportMsg(''), 3000);
    } catch (e) {
      setExportMsg('err');
      setTimeout(() => setExportMsg(''), 5000);
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary || {};
  const orders = Array.isArray(data?.orders) ? data.orders : [];

  const outsourcingMetrics = [
    { label: 'Total Revenue', value: fmtFull(summary.totalRevenue, currency), accent: '#00D4FF' },
    { label: 'Carrier Cost', value: fmtFull(summary.totalCarrierCost, currency), accent: '#FF3B5C' },
    { label: 'Gross Profit', value: fmtFull(summary.grossProfit, currency), accent: '#00E599' },
    { label: 'Margin', value: pct(summary.profitMargin), accent: '#A78BFA' },
    {
      label: 'Pending (Customer)',
      value: fmtFull(summary.pendingCustomerAmt, currency),
      sub: `${summary.pendingCustomerCount || 0} unpaid`,
      accent: '#FFB800',
    },
    {
      label: 'Pending (Carrier)',
      value: fmtFull(summary.pendingCarrierAmt, currency),
      sub: `${summary.pendingCarrierCount || 0} unpaid`,
      accent: '#FF8C42',
    },
    { label: 'Orders', value: String(summary.totalOrders || 0), accent: '#5E6B8A' },
  ];

  const regularMetrics = [
    { label: 'Total Revenue', value: fmtFull(summary.totalRevenue, currency), accent: '#00D4FF' },
    { label: 'Total Profit', value: fmtFull(summary.totalProfit, currency), accent: '#00E599' },
    {
      label: 'OO Orders',
      value: String(summary.ownerOperatorOrders || 0),
      sub: `Sett. ${fmtFull(summary.ownerOperatorSettlement, currency)}`,
      accent: '#A78BFA',
    },
    { label: 'OO Co. Profit', value: fmtFull(summary.ownerOperatorProfit, currency), accent: '#FFB800' },
    {
      label: 'Driver Orders',
      value: String(summary.companyDriverOrders || 0),
      sub: `Rev. ${fmtFull(summary.companyDriverRevenue, currency)}`,
      accent: '#00D4FF',
    },
    { label: 'Total Orders', value: String(summary.totalOrders || 0), accent: '#5E6B8A' },
  ];

  const metrics = type === 'outsourcing' ? outsourcingMetrics : regularMetrics;

  return (
    <AuthLayout>
      <style>{CSS}</style>
      <div className="fr-page">
        <div className="fr-grid-bg" />

        <div className="fr-header !p-0 !border-0">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span className="fr-title">Finance Report</span>
                {loading && <span className="fr-pulse" />}
              </div>
              <div className="fr-subtitle">
                {data?.dateRange
                  ? `${shortDate(data.dateRange.from)} — ${shortDate(data.dateRange.to)} · ${orders.length} orders`
                  : 'Select a period to load the report'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {exportMsg === 'ok' && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00E599' }}>
                  ✓ downloaded
                </span>
              )}
              {exportMsg === 'err' && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#FF3B5C' }}>
                  ✗ export failed
                </span>
              )}
              <button
                className="fr-export-btn"
                onClick={handleExportPdf}
                disabled={exporting || !data || orders.length === 0}
              >
                {exporting ? (
                  <>
                    <span className="fr-pulse" style={{ background: '#00E599' }} />
                    Generating…
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6 1v6.5M3 5.5l3 3 3-3M1 10h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Export PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="fr-controls">
            <div className="fr-module-wrap">
              {['outsourcing', 'regular'].map((m) => (
                <button
                  key={m}
                  className={`fr-mod-btn${type === m ? ' active' : ''}`}
                  onClick={() => setType(m)}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="fr-vdiv" />

            <div className="fr-period-wrap">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  className={`fr-per-btn${period === p.value ? ' active' : ''}`}
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                <input
                  className="fr-date-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11 }}>→</span>
                <input
                  className="fr-date-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <button className="fr-apply-btn" onClick={fetchReport}>
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="fr-body !p-0 !pt-6">
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="fr-skeleton"
                    style={{ height: 86, animationDelay: `${i * 0.07}s` }}
                  />
                ))}
              </div>
              <div className="fr-skeleton" style={{ height: 260 }} />
            </div>
          )}

          {!loading && data && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
                {metrics.map((m, i) => (
                  <div key={i} className="fr-card" style={{ '--fr-accent': m.accent }}>
                    <div className="fr-card-glow" />
                    <div className="fr-card-label !text-[16px]">{m.label}</div>
                    <div className="fr-card-value !text-xl" style={{ color: m.accent }}>
                      {m.value}
                    </div>
                    {m.sub && <div className="fr-card-sub">{m.sub}</div>}
                  </div>
                ))}
              </div>

              {orders.length === 0 ? (
                <div className="fr-empty">No orders found for the selected period</div>
              ) : type === 'outsourcing' ? (
                <OutsourcingTable orders={orders} currency={currency} />
              ) : (
                <RegularTable orders={orders} currency={currency} />
              )}
            </>
          )}

          {!loading && !data && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 20px',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 11,
                  background: 'rgba(0,212,255,0.06)',
                  border: '1px solid rgba(0,212,255,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="4" width="16" height="12" rx="2" stroke="rgba(0,212,255,0.45)" strokeWidth="1.5" />
                  <path d="M6 8h8M6 11h5" stroke="rgba(0,212,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10.5,
                  color: 'rgba(255,255,255,0.18)',
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                }}
              >
                Select a period above to load data
              </span>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

function OutsourcingTable({ orders, currency }) {
  const totals = orders.reduce(
    (acc, o) => ({
      revenue: acc.revenue + Number(o.total_amount || 0),
      cost: acc.cost + Number(o.carrier_amount || 0),
      profit: acc.profit + (Number(o.total_amount || 0) - Number(o.carrier_amount || 0)),
    }),
    { revenue: 0, cost: 0, profit: 0 }
  );

  return (
    <div className="fr-table-wrap">
      <table className="fr-tbl" style={{ minWidth: 1020 }}>
        <thead>
          <tr>
            <th>Order # / Date</th>
            <th>Customer</th>
            <th>Carrier</th>
            <th>Route</th>
            <th className="r">Revenue</th>
            <th className="r">Carrier Cost</th>
            <th className="r">Profit</th>
            <th className="c">Cust. Pay</th>
            <th className="c">Carrier Pay</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => {
            const profit = Number(o.total_amount || 0) - Number(o.carrier_amount || 0);
            return (
              <tr key={i}>
                <td>
                  <Link to={`/view/order/${o._id}`} style={{ textDecoration: 'none' }}>
                    <div className="fr-num fr-cyan" style={{ fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(0,212,255,0.4)' }}>
                      #{o.serial_no || o.customer_order_no || '—'}
                    </div>
                  </Link>
                  <div className="fr-dim fr-mono" style={{ marginTop: 2 }}>{shortDate(o.createdAt)}</div>
                </td>
                <td>
                  <Link to={`/customer/detail/${o.customer?._id}`} className="fr-link" style={{ fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>
                    {o.customer?.name || '—'}
                  </Link>
                </td>
                <td>
                  <Link to={`/carrier/detail/${o.carrier?._id}`} className="fr-link" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {o.carrier?.name || '—'}
                  </Link>
                  {o.carrier?.mc_code && (
                    <div className="fr-dim fr-mono">MC: {o.carrier.mc_code}</div>
                  )}
                </td>
                <td>
                  {(() => { const r = routeFromShipping(o.shipping_details); return (
                    <div>
                      <div className="fr-dim" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.from}</div>
                      <div className="fr-dim" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>↳ {r.to}</div>
                    </div>
                  ); })()}
                </td>
                <td className="r">
                  <span className="fr-num fr-cyan">{fmtFull(o.total_amount, currency)}</span>
                </td>
                <td className="r">
                  <span className="fr-num fr-red">{fmtFull(o.carrier_amount, currency)}</span>
                </td>
                <td className="r">
                  <span className={`fr-num ${profit >= 0 ? 'fr-green' : 'fr-red'}`}>
                    {fmtFull(profit, currency)}
                  </span>
                </td>
                <td className="c">
                  <StatusPill status={o.customer_payment_status} />
                </td>
                <td className="c">
                  <StatusPill status={o.carrier_payment_status} />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                TOTAL · {orders.length} ORDERS
              </span>
            </td>
            <td className="r">
              <span className="fr-num fr-cyan" style={{ fontSize: 13 }}>{fmtFull(totals.revenue, currency)}</span>
            </td>
            <td className="r">
              <span className="fr-num fr-red" style={{ fontSize: 13 }}>{fmtFull(totals.cost, currency)}</span>
            </td>
            <td className="r">
              <span
                className={`fr-num ${totals.profit >= 0 ? 'fr-green' : 'fr-red'}`}
                style={{ fontSize: 13 }}
              >
                {fmtFull(totals.profit, currency)}
              </span>
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function RegularTable({ orders, currency }) {
  const totals = orders.reduce(
    (acc, o) => ({
      revenue: acc.revenue + Number(o.total_amount || 0),
      profit: acc.profit + Number(o.owner_profit || 0),
      settlement: acc.settlement + Number(o.settle_amount || 0),
    }),
    { revenue: 0, profit: 0, settlement: 0 }
  );

  return (
    <div className="fr-table-wrap">
      <table className="fr-tbl" style={{ minWidth: 980 }}>
        <thead>
          <tr>
            <th>Order # / Date</th>
            <th>Customer</th>
            <th>Type / Owner</th>
            <th>Truck</th>
            <th>Route</th>
            <th className="r">Revenue</th>
            <th className="r">Settlement</th>
            <th className="r">Co. Profit</th>
            <th className="c">Payment</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => {
            const isOO = o.isOwnerOperatedTruck;
            return (
              <tr key={i}>
                <td>
                  <Link to={`/view/order/${o._id}`} style={{ textDecoration: 'none' }}>
                    <div className="fr-num fr-cyan" style={{ fontSize: 12, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(0,212,255,0.4)' }}>
                      #{o.serial_no || o.customer_order_no || '—'}
                    </div>
                  </Link>
                  <div className="fr-dim fr-mono" style={{ marginTop: 2 }}>{shortDate(o.createdAt)}</div>
                </td>
                <td>
                  <Link to={`/customer/detail/${o.customer?._id}`} className="fr-link" style={{ fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>
                    {o.customer?.name || '—'}
                  </Link>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span
                      className="fr-type-badge"
                      style={
                        isOO
                          ? { background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#A78BFA' }
                          : { background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF' }
                      }
                    >
                      {isOO ? 'OO' : 'Driver'}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 12 }}>
                      {isOO ? o.ownerOperator?.fullName || '—' : '—'}
                    </span>
                  </div>
                </td>
                <td>
                  {o.truck?._id ? (
                    <Link to={`/truck/detail/${o.truck._id}`} className="fr-link">
                      <span className="fr-mono" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>
                        {o.truck.unitNumber || o.truck.plateNumber || '—'}
                      </span>
                    </Link>
                  ) : (
                    <span className="fr-mono" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>—</span>
                  )}
                </td>
                <td>
                  {(() => { const r = routeFromShipping(o.shipping_details); return (
                    <div>
                      <div className="fr-dim" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.from}</div>
                      <div className="fr-dim" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>↳ {r.to}</div>
                    </div>
                  ); })()}
                </td>
                <td className="r">
                  <span className="fr-num fr-cyan">{fmtFull(o.total_amount, currency)}</span>
                </td>
                <td className="r">
                  <span className="fr-num fr-amber">
                    {isOO ? fmtFull(o.settle_amount, currency) : '—'}
                  </span>
                </td>
                <td className="r">
                  <span className="fr-num fr-green">{fmtFull(o.owner_profit, currency)}</span>
                </td>
                <td className="c">
                  <StatusPill status={o.customer_payment_status} />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.25)',
                }}
              >
                TOTAL · {orders.length} ORDERS
              </span>
            </td>
            <td className="r">
              <span className="fr-num fr-cyan" style={{ fontSize: 13 }}>
                {fmtFull(totals.revenue, currency)}
              </span>
            </td>
            <td className="r">
              <span className="fr-num fr-amber" style={{ fontSize: 13 }}>
                {fmtFull(totals.settlement, currency)}
              </span>
            </td>
            <td className="r">
              <span className="fr-num fr-green" style={{ fontSize: 13 }}>
                {fmtFull(totals.profit, currency)}
              </span>
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
