import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import Loading from '../../common/Loading';

export default function OwnerOperatorStatement() {
  const { id } = useParams();
  const location = useLocation();
  const { Errors, company } = useContext(UserContext);

  const [loading, setLoading] = useState(true);
  const [slip, setSlip] = useState(location?.state?.slip || null);
  const [payload, setPayload] = useState(null);
  const [records, setRecords] = useState([]);

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');

  const pdfRef = useRef(null);

  const slipMonth = Number(slip?.month || 0);
  const slipYear = Number(slip?.year || 0);
  const ownerId = slip?.ownerOperator?._id || slip?.ownerOperator || null;

  const displayCurrency = useMemo(() => {
    const companyCurrency = String(company?.currency || '').trim().toUpperCase();
    const slipCurrency = String(slip?.currency || '').trim().toUpperCase();
    return slipCurrency || companyCurrency || 'USD';
  }, [company, slip]);

  const formatCurrency = (amount) => `${displayCurrency} ${Number(amount || 0).toFixed(2)}`;

  const shortDate = (value) => {
    const d = value ? new Date(value) : null;
    if (!d || Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };

  const fullDate = (value) => {
    const d = value ? new Date(value) : null;
    if (!d || Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${mm}/${dd}/${yyyy}`;
  };

  const extractRoute = (details = [], fallbackDate) => {
    const block = Array.isArray(details) ? details[0] : null;
    const fallback = fallbackDate ? new Date(fallbackDate) : null;
    if (block && (block.pickup_location || block.delivery_location)) {
      return {
        pickedDate: block.pickup_date || fallbackDate || null,
        fromCity: String(block.pickup_location || '').trim(),
        dropDate: block.delivery_date || fallbackDate || null,
        toCity: String(block.delivery_location || '').trim(),
      };
    }
    const locs = Array.isArray(block?.locations) ? block.locations : [];
    if (locs.length > 0) {
      const start = locs[0] || {};
      const end = locs[locs.length - 1] || {};
      const startLabel = `${start.city || ''}${start.state ? `-${start.state}` : ''}`.trim() || String(start.location || start.address || '').trim();
      const endLabel = `${end.city || ''}${end.state ? `-${end.state}` : ''}`.trim() || String(end.location || end.address || '').trim();
      return {
        pickedDate: start.date || start.pickup_date || start.datetime || fallbackDate || null,
        fromCity: startLabel,
        dropDate: end.date || end.delivery_date || end.datetime || fallbackDate || null,
        toCity: endLabel,
      };
    }
    return {
      pickedDate: fallback ? fallback.toISOString() : null,
      fromCity: '',
      dropDate: fallback ? fallback.toISOString() : null,
      toCity: '',
    };
  };

  const loadSlip = useCallback(async () => {
    if (slip?._id) return;
    if (!id) return;
    setLoading(true);
    try {
      const res = await Api.get(`/owner-operators/salary/detail/${id}`);
      if (res.data?.status && res.data?.salary) setSlip(res.data.salary);
      else setSlip(null);
    } catch (err) {
      Errors(err);
      setSlip(null);
    } finally {
      setLoading(false);
    }
  }, [Errors, id, slip?._id]);

  const loadStatementData = useCallback(async () => {
    if (!ownerId || !slipMonth || !slipYear) return;
    setLoading(true);
    try {
      const includePrevDueForStatement = Number(slip?.previousDueAdded || 0) > 0;
      const qs = new URLSearchParams({
        ownerOperatorId: String(ownerId),
        month: String(slipMonth),
        year: String(slipYear),
        payoutCurrency: String(displayCurrency || 'USD'),
        includePreviousDue: includePrevDueForStatement ? 'true' : 'false',
      });
      const [breakdownRes, recordsRes] = await Promise.all([
        Api.get(`/owner-operators/reports/breakdown?${qs.toString()}`),
        Api.get(`/owner-operators/financial/${ownerId}`),
      ]);
      if (breakdownRes.data?.status && breakdownRes.data?.data) setPayload(breakdownRes.data.data);
      else setPayload(null);

      const all = Array.isArray(recordsRes.data?.records) ? recordsRes.data.records : [];
      const filtered = all.filter((r) => {
        const recMonth = Number(r?.month || 0);
        const recYear = Number(r?.year || 0);
        const createdAt = r?.createdAt ? new Date(r.createdAt) : null;
        const fallbackMonth = createdAt ? (createdAt.getMonth() + 1) : 0;
        const fallbackYear = createdAt ? createdAt.getFullYear() : 0;
        const sameMonth =
          (recMonth === slipMonth && recYear === slipYear) ||
          ((recMonth === 0 || recYear === 0) && fallbackMonth === slipMonth && fallbackYear === slipYear);
        return sameMonth && (
          r?.type === 'SALARY_PAYMENT' ||
          r?.type === 'ADJUSTMENT' ||
          r?.type === 'DRIVER_DEDUCTION'
        );
      });
      setRecords(filtered);
    } catch (err) {
      Errors(err);
      setPayload(null);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [Errors, displayCurrency, ownerId, slip?.previousDueAdded, slipMonth, slipYear]);

  useEffect(() => {
    loadSlip();
  }, [loadSlip]);

  useEffect(() => {
    if (!slip?._id) return;
    loadStatementData();
  }, [loadStatementData, slip?._id]);

  const statementSource = payload || slip;
  const ownerName = statementSource?.ownerOperator?.fullName || slip?.ownerOperator?.fullName || 'Owner Operator';
  const ownerCompany = statementSource?.ownerOperator?.companyName || slip?.ownerOperator?.companyName || '';
  const ownerCode = statementSource?.ownerOperator?.ownerOperatorId || slip?.ownerOperator?.ownerOperatorId || '-';
  const ownerAddress = statementSource?.ownerOperator?.address || '';
  const ownerEmail = statementSource?.ownerOperator?.email || '';
  const ownerPhone = statementSource?.ownerOperator?.phone || '';
  const monthLabel = new Date(slipYear, Math.max(slipMonth - 1, 0), 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });

  const orders = Array.isArray(statementSource?.orderBreakdown) ? statementSource.orderBreakdown : [];
  const tableRows = orders.map((order) => {
    const route = extractRoute(order?.shipping_details, order?.orderCreatedAt || null);
    const settleAmount = Number(order?.settleAmount || 0);
    const driverDeduction = Number(order?.driverDeduction || 0);
    return {
      trip: order?.serial_no ?? '',
      inv: order?.customer_order_no ?? '',
      truckUnit: order?.truck?.unitNumber || '',
      truckPlate: order?.truck?.plateNumber || '',
      picked: shortDate(route.pickedDate || '') || '',
      from: route.fromCity || '',
      drop: shortDate(route.dropDate || '') || '',
      to: route.toCity || '',
      miles: Number(order?.driverMiles || 0),
      settle: settleAmount,
      driverDed: driverDeduction,
      driverNames: Array.isArray(order?.driverNames) ? order.driverNames : [],
      final: settleAmount - driverDeduction,
    };
  });

  const totals = tableRows.reduce((acc, r) => ({
    miles: acc.miles + Number(r.miles || 0),
    settle: acc.settle + Number(r.settle || 0),
    driverDed: acc.driverDed + Number(r.driverDed || 0),
    final: acc.final + Number(r.final || 0),
  }), { miles: 0, settle: 0, driverDed: 0, final: 0 });

  const previousDueAdded = Number(statementSource?.previousDueAdded || 0);
  const totalDriverDeduction = Number(statementSource?.totalDriverDeduction || totals.driverDed);
  const manualAddition = Number(statementSource?.manualAddition || 0);
  const manualDeduction = Number(statementSource?.manualDeduction || 0);
  const manualAdjustmentSummary = manualAddition - manualDeduction;
  const grossPay = Number(totals.settle || 0);
  const finalPayable = grossPay - totalDriverDeduction + previousDueAdded + manualAdjustmentSummary;

  const paymentRows = (records || [])
    .filter((r) => r?.type === 'SALARY_PAYMENT')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const lastPayment = paymentRows[0] || null;
  const paymentNo = lastPayment?._id ? String(lastPayment._id).slice(-6) : '';
  const paymentDate = lastPayment?.createdAt || null;
  const payPeriodFrom = new Date(slipYear, Math.max(slipMonth - 1, 0), 1);
  const payPeriodTo = new Date(slipYear, slipMonth, 0);

  const recordsForStatement = useMemo(() => {
    const rows = Array.isArray(records) ? [...records] : [];

    if (previousDueAdded > 0) {
      rows.unshift({
        _id: `synthetic-prev-due-${slipMonth}-${slipYear}`,
        type: 'PREVIOUS_DUE',
        amount: Number(previousDueAdded),
        month: slipMonth,
        year: slipYear,
        createdAt: paymentDate || payPeriodFrom,
        notes: 'Carry-forward from previous month due',
        paymentStatus: statementSource?.paymentStatus || 'pending',
        meta: { expenseType: 'addition' },
        isSynthetic: true,
      });
    }

    const hasDriverDeductionRecord = rows.some((r) => r?.type === 'DRIVER_DEDUCTION');
    if (!hasDriverDeductionRecord && totalDriverDeduction > 0) {
      rows.push({
        _id: `synthetic-driver-deduction-${slipMonth}-${slipYear}`,
        type: 'DRIVER_DEDUCTION',
        amount: -Math.abs(Number(totalDriverDeduction)),
        month: slipMonth,
        year: slipYear,
        createdAt: paymentDate || payPeriodFrom,
        notes: 'Auto-calculated from order driver cost',
        paymentStatus: statementSource?.paymentStatus || 'pending',
        meta: { expenseType: 'deduction' },
        isSynthetic: true,
      });
    }

    return rows.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [paymentDate, payPeriodFrom, previousDueAdded, records, slipMonth, slipYear, statementSource?.paymentStatus, totalDriverDeduction]);

  const downloadPDF = async () => {
    setDownloadingPdf(true);
    setPdfProgress('Preparing PDF...');
    window.scrollTo(0, 0);
    const element = pdfRef.current;
    if (!element) {
      setDownloadingPdf(false);
      setPdfProgress('');
      return;
    }
    try {
      setPdfProgress('Downloading PDF...');
      const includePrevDueForStatement = Number(slip?.previousDueAdded || 0) > 0;
      const qs = new URLSearchParams({
        payoutCurrency: String(displayCurrency || 'USD'),
        includePreviousDue: includePrevDueForStatement ? 'true' : 'false',
      });
      const res = await Api.get(`/owner-operators/salary/pdf/${id}?${qs.toString()}`, { responseType: 'blob' });
      const rawBlob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const buf = await rawBlob.arrayBuffer();
      const header = new TextDecoder('ascii').decode(buf.slice(0, 5));
      if (header !== '%PDF-') {
        const text = new TextDecoder('utf-8').decode(buf.slice(0, 500));
        throw new Error(text || 'Invalid PDF response');
      }
      const blob = new Blob([buf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeOwner = String(ownerName || 'owner').replace(/[^a-z0-9-_]+/gi, '_');
      link.download = `OwnerOperator_Statement_${safeOwner}_${slipMonth}_${slipYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setPdfProgress('PDF downloaded successfully!');
      setTimeout(() => setPdfProgress(''), 3000);
      setDownloadingPdf(false);
      return;
    } catch (e) {
      let msg = String(e?.message || '');
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.message) msg = String(parsed.message);
      } catch (err) {
      }
      setPdfProgress(msg ? `PDF download failed: ${msg}` : 'PDF download failed');
      setDownloadingPdf(false);
      return;
    }
  };

  const statementNo = slip?._id ? `OOS-${String(slip._id).slice(-8).toUpperCase()}` : '—';
  const payStatus = String(statementSource?.paymentStatus || 'pending');
  const statusStyle = payStatus === 'paid'
    ? { bg: '#d1fae5', text: '#065f46', label: 'PAID' }
    : payStatus === 'partial'
      ? { bg: '#fef3c7', text: '#92400e', label: 'PARTIAL' }
      : { bg: '#fee2e2', text: '#991b1b', label: 'PENDING' };
  const balanceDue = Number(statementSource?.dueAmount ?? Math.max(finalPayable - Number(statementSource?.paidAmount || 0), 0));
  const paidAmount = Number(statementSource?.paidAmount || 0);

  if (loading && !slip) {
    return (
      <AuthLayout>
        <Loading />
      </AuthLayout>
    );
  }

  if (!slip) {
    return (
      <AuthLayout>
        <div className="p-6">
          <div className="bg-white rounded-xl p-6">
            <div className="text-lg font-semibold">Payslip not found</div>
            <div className="mt-4">
              <Link to="/accounts/owner-operator-salary" className="text-indigo-600 font-semibold">Back</Link>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <style>{`
        .inv-page { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; color: #0f172a; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .inv-page * { box-sizing: border-box; }
        .inv-tbl { width: 100%; border-collapse: collapse; }
        .inv-tbl th { background: #1e3a5f !important; color: #fff !important; font-size: 10px; font-weight: 700; padding: 8px 9px; border: 1px solid #1e3a5f; text-align: left; white-space: nowrap; }
        .inv-tbl td { font-size: 10px; padding: 7px 9px; border: 1px solid #e2e8f0; vertical-align: top; color: #0f172a; }
        .inv-tbl tbody tr:nth-child(even) td { background: #f8fafc; }
        .inv-tbl tfoot td { background: #eef2ff !important; font-weight: 700; border-top: 2px solid #1e3a5f; color: #1e3a5f; }
        .inv-tbl .num { text-align: right; white-space: nowrap; font-family: "Courier New", monospace; }
        .inv-rec-tbl { width: 100%; border-collapse: collapse; }
        .inv-rec-tbl th { background: #374151 !important; color: #fff !important; font-size: 10px; font-weight: 700; padding: 7px 9px; border: 1px solid #374151; text-align: left; }
        .inv-rec-tbl td { font-size: 10px; padding: 7px 9px; border: 1px solid #e2e8f0; vertical-align: top; color: #0f172a; }
        .inv-rec-tbl tbody tr:nth-child(even) td { background: #f9fafb; }
        .inv-rec-tbl .num { text-align: right; white-space: nowrap; font-family: "Courier New", monospace; }
        .inv-mono { font-family: "Courier New", Courier, monospace; font-variant-numeric: tabular-nums; }
        .inv-section { page-break-inside: avoid; break-inside: avoid; }
      `}</style>

      <div className="min-h-screen bg-slate-100 py-6 px-4">
        {/* Toolbar */}
        <div className="max-w-[900px] mx-auto mb-5 flex flex-wrap justify-between items-center gap-3">
          <div>
            <Link to="/accounts/owner-operator-salary" className="text-sm font-semibold text-indigo-600 hover:underline">← Back to Salary List</Link>
            <div className="text-xs text-slate-400 mt-0.5">{ownerName} &bull; {monthLabel} &bull; {statementNo}</div>
          </div>
          <div className="flex items-center gap-3">
            {pdfProgress ? <span className="text-xs px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600">{pdfProgress}</span> : null}
            <button
              className="h-9 px-5 rounded-lg text-[13px] font-semibold bg-indigo-600 text-white disabled:opacity-60 hover:bg-indigo-700 transition-colors"
              onClick={downloadPDF}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? 'Generating PDF…' : '↓ Export PDF'}
            </button>
          </div>
        </div>

        {/* Invoice Document */}
        <div
          ref={pdfRef}
          id="pdf-root"
          className="inv-page max-w-[900px] mx-auto shadow-2xl rounded-lg overflow-hidden"
        >
          {/* ── Header Banner ── */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)', padding: '28px 36px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                {company?.logo
                  ? <img src={company.logo} alt="logo" style={{ maxHeight: '56px', maxWidth: '200px', display: 'block', marginBottom: '14px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                  : (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '1.5px', lineHeight: 1 }}>{String(company?.name || 'COMPANY').toUpperCase()}</div>
                      <div style={{ width: '40px', height: '3px', background: '#f59e0b', marginTop: '6px', borderRadius: '2px' }} />
                    </div>
                  )
                }
                <div style={{ color: '#93c5fd', fontSize: '11px', lineHeight: '1.7' }}>
                  {company?.address && <div>{company.address}</div>}
                  {company?.phone && <div>Tel: {company.phone}</div>}
                  {company?.email && <div>{company.email}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: '#93c5fd', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Owner Operator</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '1px', padding: '10px 0' }}>PAYMENT <span style={{ color: '#f59e0b' }}>STATEMENT</span></div>
                
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '8px', padding: '10px 14px', textAlign: 'left', minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#93c5fd', fontWeight: 600 }}>STATEMENT #</span>
                    <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'Courier New, monospace', fontWeight: 700 }}>{statementNo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#93c5fd', fontWeight: 600 }}>DATE</span>
                    <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'Courier New, monospace' }}>{fullDate(new Date())}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '10px', color: '#93c5fd', fontWeight: 600 }}>PERIOD</span>
                    <span style={{ fontSize: '11px', color: '#fff', fontFamily: 'Courier New, monospace' }}>{monthLabel}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', color: '#93c5fd', fontWeight: 600 }}>STATUS</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'Courier New, monospace', color: payStatus === 'paid' ? '#4ade80' : payStatus === 'partial' ? '#fbbf24' : '#f87171' }}>
                      {statusStyle.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── FROM / PAY TO ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ padding: '20px 28px', borderRight: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', letterSpacing: '1.5px', marginBottom: '10px', textTransform: 'uppercase' }}>From</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>{String(company?.name || 'Company')}</div>
              {company?.address && <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>{company.address}</div>}
              {company?.phone && <div style={{ fontSize: '11px', color: '#475569' }}>Tel: {company.phone}</div>}
              {company?.email && <div style={{ fontSize: '11px', color: '#475569' }}>{company.email}</div>}
              <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', borderLeft: '3px solid #1e3a5f' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Pay Period</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a5f', fontFamily: 'Courier New, monospace' }}>
                  {fullDate(payPeriodFrom)} — {fullDate(payPeriodTo)}
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 28px', background: '#f0f7ff' }}>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#1e3a5f', letterSpacing: '1.5px', marginBottom: '10px', textTransform: 'uppercase' }}>Pay To</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '2px' }}>{ownerName}</div>
              {ownerCompany && <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>{ownerCompany}</div>}
              <div style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '2px 8px', borderRadius: '12px', marginBottom: '8px', fontFamily: 'Courier New, monospace' }}>
                ID: {ownerCode}
              </div>
              {ownerAddress && <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px', whiteSpace: 'pre-line' }}>{ownerAddress}</div>}
              {ownerEmail && <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>✉ {ownerEmail}</div>}
              {ownerPhone && <div style={{ fontSize: '11px', color: '#475569' }}>✆ {ownerPhone}</div>}
            </div>
          </div>

          {/* ── Order Breakdown Table ── */}
          <div style={{ padding: '20px 28px 0' }} className="inv-section">
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#1e3a5f', letterSpacing: '1.5px', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '16px', background: '#1e3a5f', borderRadius: '2px', flexShrink: 0 }} />
              Order Breakdown &mdash; {monthLabel}
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', marginLeft: '4px' }}>({tableRows.length} orders)</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="inv-tbl">
                <thead>
                  <tr>
                    <th style={{ width: '6%' }}>Trip #</th>
                    <th style={{ width: '10%' }}>Invoice #</th>
                    <th style={{ width: '8%' }}>Truck</th>
                    <th style={{ width: '20%' }}>Pickup</th>
                    <th style={{ width: '20%' }}>Delivery</th>
                    <th className="num" style={{ width: '7%' }}>Miles</th>
                    <th className="num" style={{ width: '14%' }}>Settlement</th>
                    <th className="num" style={{ width: '15%' }}>Driver Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontStyle: 'italic' }}>No orders found for this period</td></tr>
                  ) : tableRows.map((r, idx) => (
                    <tr key={`ord-${idx}`}>
                      <td className="inv-mono" style={{ fontWeight: 700, color: '#1e40af' }}>{r.trip || '—'}</td>
                      <td className="inv-mono">{r.inv || '—'}</td>
                      <td>
                        {r.truckUnit && <div className="inv-mono" style={{ fontWeight: 700 }}>{r.truckUnit}</div>}
                        {r.truckPlate && <div style={{ fontSize: '9px', color: '#64748b' }}>{r.truckPlate}</div>}
                        {!r.truckUnit && !r.truckPlate && <span style={{ color: '#94a3b8' }}>—</span>}
                      </td>
                      <td>
                        {r.picked && <div className="inv-mono" style={{ fontSize: '9px', color: '#64748b' }}>{r.picked}</div>}
                        <div style={{ fontWeight: 600, fontSize: '11px' }}>{r.from || '—'}</div>
                      </td>
                      <td>
                        {r.drop && <div className="inv-mono" style={{ fontSize: '9px', color: '#64748b' }}>{r.drop}</div>}
                        <div style={{ fontWeight: 600, fontSize: '11px' }}>{r.to || '—'}</div>
                      </td>
                      <td className="num inv-mono">{Number(r.miles || 0).toFixed(0)}</td>
                      <td className="num inv-mono" style={{ color: '#1e40af', fontWeight: 700 }}>{formatCurrency(r.settle)}</td>
                      <td className="num inv-mono" style={{ fontSize: '12px', color: r.driverDed > 0 ? '#dc2626' : '#94a3b8' }}>
                        {r.driverDed > 0 ? `-${formatCurrency(r.driverDed)}` : '—'}
                        {r.driverNames?.length > 0 && (
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{r.driverNames.join(', ')}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={5} style={{ fontWeight: 800, fontSize: '11px', letterSpacing: '0.5px' }}>TOTAL</td>
                    <td className="num inv-mono">{Number(totals.miles || 0).toFixed(0)}</td>
                    <td className="num inv-mono" style={{ color: '#1e40af', fontSize: '12px' }}>{formatCurrency(totals.settle)}</td>
                    <td className="num inv-mono" style={{ color: totals.driverDed > 0 ? '#dc2626' : '#94a3b8', fontSize: '12px' }}>
                      {totals.driverDed > 0 ? `-${formatCurrency(totals.driverDed)}` : '—'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── Transaction Records + Earnings Summary ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', padding: '20px 28px', alignItems: 'start', borderTop: '1px solid #f1f5f9', marginTop: '20px' }}>

            {/* Left: Transaction Records */}
            <div style={{ paddingRight: '20px' }} className="inv-section">
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#374151', letterSpacing: '1.5px', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '14px', background: '#374151', borderRadius: '2px', flexShrink: 0 }} />
                Transaction Records
              </div>
              <table className="inv-rec-tbl">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Date</th>
                    <th style={{ width: '28%' }}>Type</th>
                    <th className="num" style={{ width: '27%' }}>Amount</th>
                    <th style={{ width: '20%' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsForStatement.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '14px', fontStyle: 'italic' }}>No records</td></tr>
                  ) : recordsForStatement.map((r) => {
                    const type = String(r?.type || '').toUpperCase();
                    const expenseType = String(r?.meta?.expenseType || '').toLowerCase();
                    const isDeduction = type === 'DRIVER_DEDUCTION' || (type === 'ADJUSTMENT' && expenseType === 'deduction');
                    const isPayment = type === 'SALARY_PAYMENT';
                    const label =
                      type === 'SALARY_PAYMENT' ? 'Payment' :
                      type === 'DRIVER_DEDUCTION' ? 'Driver Ded.' :
                      type === 'PREVIOUS_DUE' ? 'Prev. Due' :
                      type === 'ADJUSTMENT' ? (isDeduction ? 'Deduction' : 'Addition') : type;
                    const amount = Number(r?.amount || 0);
                    const signed = isDeduction ? -Math.abs(amount) : (isPayment ? Math.abs(amount) : amount);
                    const isNeg = signed < 0;
                    return (
                      <tr key={String(r?._id)}>
                        <td className="inv-mono" style={{ fontSize: '9px' }}>{fullDate(r?.createdAt)}</td>
                        <td style={{ fontSize: '10px' }}>{label}</td>
                        <td className="num inv-mono" style={{ color: isNeg ? '#dc2626' : '#065f46', fontWeight: 700 }}>
                          {isNeg ? `-${formatCurrency(Math.abs(signed))}` : `+${formatCurrency(Math.abs(signed))}`}
                        </td>
                        <td style={{ fontSize: '9px', color: '#64748b' }}>{String(r?.notes || '').slice(0, 28)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right: Earnings Summary */}
            <div style={{ paddingLeft: '20px', borderLeft: '1px solid #e2e8f0' }} className="inv-section">
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#1e3a5f', letterSpacing: '1.5px', marginBottom: '10px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '14px', background: '#1e3a5f', borderRadius: '2px', flexShrink: 0 }} />
                Earnings Summary
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: 'Gross Settlement', amount: grossPay, color: '#0f172a', sign: '', bold: false },
                    { label: 'Driver Salary Deduction', amount: totalDriverDeduction, color: '#dc2626', sign: '−', bold: false },
                    ...(previousDueAdded > 0 ? [{ label: 'Previous Month Due', amount: previousDueAdded, color: '#065f46', sign: '+', bold: false }] : []),
                    ...(manualAddition > 0 ? [{ label: 'Manual Addition', amount: manualAddition, color: '#065f46', sign: '+', bold: false }] : []),
                    ...(manualDeduction > 0 ? [{ label: 'Manual Deduction', amount: manualDeduction, color: '#dc2626', sign: '−', bold: false }] : []),
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '7px 10px', fontSize: '11px', color: '#777a7f', borderBottom: '1px solid #f1f5f9' }}>{row.label}</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'Courier New, monospace', fontSize: '11px', fontWeight: 700, color: row.color, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {row.sign}&nbsp;{formatCurrency(row.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} style={{ padding: '1px 0', borderBottom: '2px solid #1e3a5f' }} />
                  </tr>
                  <tr style={{ background: '#f0f7ff' }}>
                    <td style={{ padding: '10px', fontSize: '13px', fontWeight: 800, color: '#bac5d2' }}>Net Payable</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'Courier New, monospace', fontSize: '15px', fontWeight: 900, color: '#1e3a5f', whiteSpace: 'nowrap' }}>
                      {formatCurrency(finalPayable)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 10px', fontSize: '11px', color: '#c9cfd7', borderBottom: '1px solid #f1f5f9' }}>Amount Paid</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'Courier New, monospace', fontSize: '11px', color: '#065f46', fontWeight: 700, borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      &minus;&nbsp;{formatCurrency(paidAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Balance Due Box */}
              <div style={{ marginTop: '12px', background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)', borderRadius: '10px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#93c5fd', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Balance Due</div>
                  {paymentDate && (
                    <div style={{ color: '#64748b', fontSize: '9px', marginTop: '2px' }}>
                      Last payment: {fullDate(paymentDate)}
                    </div>
                  )}
                </div>
                <div style={{ color: '#f59e0b', fontSize: '22px', fontWeight: 900, fontFamily: 'Courier New, monospace', letterSpacing: '-0.5px' }}>
                  {formatCurrency(balanceDue)}
                </div>
              </div>

              {/* Payment Info */}
              {paymentNo && (
                <div style={{ marginTop: '8px', fontSize: '9px', color: '#94a3b8', textAlign: 'right', fontFamily: 'Courier New, monospace' }}>
                  Receipt: {paymentNo}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '14px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>
              {statementNo} &nbsp;&bull;&nbsp; {monthLabel} &nbsp;&bull;&nbsp; Generated {fullDate(new Date())}
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'right' }}>
              Computer-generated statement &mdash; No signature required
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
