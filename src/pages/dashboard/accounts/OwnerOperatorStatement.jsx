import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import { UserContext } from '../../../context/AuthProvider';
import Loading from '../../common/Loading';
import Logotext from '../../common/Logotext';

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
    return slipCurrency && slipCurrency !== 'CAD' ? slipCurrency : (companyCurrency || 'CAD');
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
        payoutCurrency: String(displayCurrency || 'CAD'),
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
  const ownerCode = statementSource?.ownerOperator?.ownerOperatorId || slip?.ownerOperator?.ownerOperatorId || '-';
  const ownerAddress = statementSource?.ownerOperator?.address || '';
  const ownerEmail = statementSource?.ownerOperator?.email || '';
  const ownerPhone = statementSource?.ownerOperator?.phone || '';
  const monthLabel = new Date(slipYear, Math.max(slipMonth - 1, 0), 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });

  const orders = Array.isArray(statementSource?.orderBreakdown) ? statementSource.orderBreakdown : [];
  const tableRows = orders.map((order) => {
    const route = extractRoute(order?.shipping_details, order?.orderCreatedAt || null);
    const truckNo = order?.truck?.unitNumber || order?.truck?.plateNumber || '';
    const settleAmount = Number(order?.settleAmount || 0);
    const driverDeduction = Number(order?.driverDeduction || 0);
    return {
      trip: order?.serial_no ?? '',
      inv: order?.customer_order_no ?? '',
      truck: truckNo || '',
      picked: shortDate(route.pickedDate || '') || '',
      from: route.fromCity || '',
      drop: shortDate(route.dropDate || '') || '',
      to: route.toCity || '',
      miles: Number(order?.driverMiles || 0),
      settle: settleAmount,
      driverDed: driverDeduction,
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
  const manualAdjustmentSummary =
    manualAddition - manualDeduction;
  const grossPay = Number(totals.settle || 0);
  const finalPayable = grossPay - totalDriverDeduction + previousDueAdded + manualAdjustmentSummary;
  const totalAdjustments = previousDueAdded + manualAdjustmentSummary;

  const adjustments = (records || [])
    .filter((r) => r?.type === 'ADJUSTMENT')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

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
        payoutCurrency: String(displayCurrency || 'CAD'),
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
      <div className="p-4 md:p-6 bg-white rounded-xl p-6">
        

        <style>
          {`
            .pdf-page {
              background: #fff;
              color: #0f172a;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              box-sizing: border-box;
            }
            .pdf-page * {
              box-sizing: border-box;
            }
            .pdf-title {
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              font-size: 26px;
              font-weight: 700;
              margin: 0;
            }
            .pdf-subtitle {
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              font-size: 13px;
              margin: 0;
              color: #111827;
            }
            .pdf-mono {
              font-family: "Courier New", Courier, monospace;
              font-variant-numeric: tabular-nums;
            }
            .pdf-table {
              width: 100%;
              border-collapse: collapse;
              color: #000 !important;
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
            }
            .pdf-table thead { display: table-header-group; }
            .pdf-table tbody tr {
              background-color: #ffffff !important;
              color: #000 !important;
            }
            .pdf-table tbody tr:nth-child(even) {
              background-color: #f8fafc !important;
            }
            .pdf-table th {
              background-color: #e0ffff !important;
              color: #000 !important;
              font-size: 10px;
              font-weight: 700;
              text-align: left;
              padding: 7px 8px;
              border: 1px solid #e2e8f0 !important;
              white-space: nowrap;
            }
            .pdf-table td {
              font-size: 10px;
              padding: 7px 8px;
              border: 1px solid #e2e8f0 !important;
              vertical-align: top;
              color: #000 !important;
              font-weight: 700;
            }
            .pdf-table tfoot tr {
              background-color: #ffffff !important;
              color: #0f172a !important;
            }
            .pdf-right {
              text-align: right;
              white-space: nowrap;
            }
            .pdf-h2 {
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              font-size: 16px;
              font-weight: 700;
              margin: 0 0 10px 0;
              color: #0f172a;
            }
            .pdf-section {
              page-break-inside: avoid;
              break-inside: avoid;
              page-break-before: auto;
              break-before: auto;
            }
            .pdf-page-break {
              page-break-before: always;
              break-before: page;
            }
            .pdf-inline-value {
              display: inline-block;
              max-width: calc(100% - 88px);
              vertical-align: top;
            }
            .pdf-wrap-anywhere {
              overflow-wrap: anywhere;
              word-break: break-word;
              white-space: normal;
            }
          `}
        </style>

        <div
          style={{
            width: '100%',
            minWidth: '0',
            maxWidth: '794px',
            boxSizing: 'border-box',
          }}
          className="pb-6 flex flex-wrap justify-between items-center gap-3 mb-4 mx-auto"
        >
          <div className="flex flex-col">
            <Link to="/accounts/owner-operator-salary" className="text-sm font-semibold text-indigo-600">Back</Link>
            <div className="text-xl font-bold text-slate-900 mt-1">Owner Operator Statement</div>
            <div className="text-sm text-slate-500">{ownerName} • {monthLabel}</div>
          </div>
          <div className="flex items-center gap-3">
            {pdfProgress ? <div className="text-xs text-slate-600">{pdfProgress}</div> : null}
            <button
              className="h-10 px-4 rounded-xl text-[13px] font-semibold bg-indigo-600 text-white disabled:opacity-60"
              onClick={downloadPDF}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? 'Downloading...' : 'Export PDF'}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center pb-12">
          <div 
            ref={pdfRef} 
            id="pdf-root" 
            className="pdf-page bg-white"
            style={{
              width: '100%',
              minWidth: '0',
              maxWidth: '794px',
              boxSizing: 'border-box',
            }}
          >
            <div className="flex justify-between items-start gap-6 pdf-section mb-5 pb-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div className="min-w-[220px]">
                <Logotext black />
                <div className="mt-0">
                <p className="pdf-subtitle text-lg font-bold">PRO # CMC{tableRows[0]?.trip || '-'}</p>
                <p className="pdf-subtitle mt-2">Date : <span className="pdf-mono">{fullDate(new Date())}</span></p>
                <p className="pdf-subtitle">
                  Pay Period : <span className="pdf-mono">{fullDate(payPeriodFrom)} to {fullDate(payPeriodTo)}</span>
                </p>
                <p className="pdf-subtitle">Statement : <span className="pdf-mono">{monthLabel}</span></p>
              
                </div>
              </div>
              <div className="text-right">
                  <p className="pdf-title pb-1">Payment Statement</p>
                  <p className="pdf-subtitle font-bold text-lg">{String(company?.name || 'Company')}</p>
                  {company?.address ? <p className="pdf-subtitle whitespace-pre-line">{String(company.address)}</p> : null}
                  {company?.email ? <p className="pdf-subtitle">{String(company.email)}</p> : null}
                  {company?.phone ? <p className="pdf-subtitle">{`PH : ${company.phone}`}</p> : null}
                
              </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row gap-8 pdf-section">
              <div className="border border-slate-200 rounded-xl p-5 flex-1 min-w-0">
                <div className="pdf-h2">Payment Details</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                  <div><span className="inline-block w-32">Payment # :</span> <span className="pdf-mono text-slate-900">{paymentNo || '-'}</span></div>
                  <div><span className="inline-block w-32">Cheque # :</span> <span className="pdf-mono text-slate-900">-</span></div>
                  <div><span className="inline-block w-32">Date :</span> <span className="pdf-mono text-slate-900">{paymentDate ? fullDate(paymentDate) : '-'}</span></div>
                  <div><span className="inline-block w-32">Employee Code :</span> <span className="pdf-mono text-slate-900">{ownerCode}</span></div>
                  <div><span className="inline-block w-32">Amount :</span> <span className="pdf-mono text-slate-900">{formatCurrency(finalPayable)}</span></div>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl p-5 flex-1 min-w-0">
                <div className="pdf-h2">Pay To</div>
                <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                  <div className="text-slate-900 text-lg mb-1">{ownerName}</div>
                  {ownerAddress ? <div className="whitespace-pre-line">{ownerAddress}</div> : null}
                  {ownerEmail ? <div className="mt-2"><span className="inline-block w-20">Email :</span> <span className="pdf-mono text-slate-900 pdf-inline-value pdf-wrap-anywhere">{ownerEmail}</span></div> : null}
                  {ownerPhone ? <div><span className="inline-block w-20">Phone :</span> <span className="pdf-mono text-slate-900">{ownerPhone}</span></div> : null}
                </div>
              </div>
            </div>

            <div className="mt-6 pdf-section">
              <div className="overflow-x-auto">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th style={{ width: '6%' }}>Trip#</th>
                      <th style={{ width: '10%' }}>Sett. Inv.#</th>
                      <th style={{ width: '6%' }}>Truck#</th>
                      <th style={{ width: '20%' }}>Pickup</th>
                      <th style={{ width: '20%' }}>Delivery</th>
                      <th className="pdf-right" style={{ width: '7%' }}>Miles</th>
                      <th className="pdf-right" style={{ width: '11%' }}>Driver Salary</th>
                      <th align="right" className="pdf-right text-right" style={{ width: '20%' }}>Settlement / Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="pdf-right">—</td>
                      </tr>
                    ) : (
                      tableRows.map((r, idx) => (
                        <tr key={`row-${idx}`}>
                          <td className="pdf-mono">{r.trip}</td>
                          <td className="pdf-mono">{r.inv}</td>
                          <td className="pdf-mono">{r.truck}</td>
                          <td>
                            <div className="pdf-mono">{r.picked}</div>
                            <div>{r.from}</div>
                          </td>
                          <td>
                            <div className="pdf-mono">{r.drop}</div>
                            <div>{r.to}</div>
                          </td>
                          <td className="pdf-right pdf-mono">{Number(r.miles || 0).toFixed(0)}</td>
                          <td className="pdf-right pdf-mono">-{formatCurrency(r.driverDed)}</td>
                          <td className="pdf-right">
                            <div className="pdf-mono">{formatCurrency(r.settle)}</div>
                            <div className="pdf-mono" style={{ marginTop: '2px', fontWeight: 700 }}>{formatCurrency(r.final)}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={5}><span className="pdf-mono">Total</span></td>
                      <td className="pdf-right pdf-mono">{Number(totals.miles || 0).toFixed(0)}</td>
                      <td className="pdf-right pdf-mono">-{formatCurrency(totals.driverDed)}</td>
                      <td className="pdf-right">
                        <div className="pdf-mono">{formatCurrency(totals.settle)}</div>
                        <div className="pdf-mono" style={{ marginTop: '2px', fontWeight: 700 }}>{formatCurrency(totals.final)}</div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-8 pdf-section">
              <div className="pdf-h2">Records (Deductions / Additions / Payments)</div>
              <div className="overflow-x-auto">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th style={{ width: '14%' }}>Date</th>
                      <th style={{ width: '10%' }}>Month</th>
                      <th style={{ width: '16%' }}>Type</th>
                      <th className="pdf-right" style={{ width: '14%' }}>Amount</th>
                      <th style={{ width: '12%' }}>Status</th>
                      <th style={{ width: '34%' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsForStatement.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="pdf-right">—</td>
                      </tr>
                    ) : (
                      recordsForStatement.map((r) => {
                        const type = String(r?.type || '').toUpperCase();
                        const expenseType = String(r?.meta?.expenseType || '').toLowerCase();
                        const isDeduction = type === 'DRIVER_DEDUCTION' || (type === 'ADJUSTMENT' && expenseType === 'deduction');
                        const isPayment = type === 'SALARY_PAYMENT';
                        const label =
                          type === 'SALARY_PAYMENT' ? 'Payment' :
                          type === 'DRIVER_DEDUCTION' ? 'Driver Deduction' :
                          type === 'PREVIOUS_DUE' ? 'Previous Due' :
                          (type === 'ADJUSTMENT' ? (isDeduction ? 'Deduction' : 'Addition') : type);
                        const status = String(r?.salary?.paymentStatus || r?.paymentStatus || statementSource?.paymentStatus || 'pending');
                        const amount = Number(r?.amount || 0);
                        const signed = isDeduction ? -Math.abs(amount) : (isPayment ? Math.abs(amount) : amount);
                        const prefix = signed < 0 ? '-' : '+';
                        return (
                          <tr key={String(r?._id)}>
                            <td className="pdf-mono">{fullDate(r?.createdAt)}</td>
                            <td className="pdf-mono">{`${slipMonth} / ${slipYear}`}</td>
                            <td>{label}</td>
                            <td className="pdf-right pdf-mono">{`${prefix}${formatCurrency(Math.abs(signed))}`}</td>
                            <td>{status.charAt(0).toUpperCase() + status.slice(1)}</td>
                            <td>{String(r?.notes || '')}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

             <div className="mt-10 pdf-section">
              <div className="pdf-h2">Adjustments</div>
              <div className="overflow-x-auto">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th style={{ width: '14%' }}>Date</th>
                      <th style={{ width: '14%' }}>Type</th>
                      <th style={{ width: '42%' }}>Notes</th>
                      <th className="pdf-right" style={{ width: '10%' }}>US$</th>
                      <th className="pdf-right" style={{ width: '10%' }}>CDN$</th>
                      <th className="pdf-right" style={{ width: '10%' }}>Charged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="pdf-right">—</td>
                      </tr>
                    ) : (
                      adjustments.map((r) => {
                        const isDeduction = String(r?.meta?.expenseType || '').toLowerCase() === 'deduction';
                        const signed = isDeduction ? -Math.abs(Number(r?.amount || 0)) : Math.abs(Number(r?.amount || 0));
                        const usd = displayCurrency === 'USD' ? signed : 0;
                        const cad = displayCurrency === 'CAD' ? signed : 0;
                        return (
                          <tr key={String(r?._id)}>
                            <td className="pdf-mono">{fullDate(r?.createdAt)}</td>
                            <td>{isDeduction ? 'Deduction' : 'Addition'}</td>
                            <td>{String(r?.notes || '')}</td>
                            <td className="pdf-right pdf-mono">{`USD ${Number(usd || 0).toFixed(2)}`}</td>
                            <td className="pdf-right pdf-mono">{`CAD ${Number(cad || 0).toFixed(2)}`}</td>
                            <td className="pdf-right pdf-mono">{formatCurrency(signed)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="pdf-right" style={{ fontWeight: 700 }}>Settlement Total</td>
                      <td colSpan={2} className="pdf-right pdf-mono" style={{ fontWeight: 700 }}>{formatCurrency(grossPay)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="pdf-right" style={{ fontWeight: 700 }}>Driver Salary Deduction</td>
                      <td colSpan={2} className="pdf-right pdf-mono" style={{ fontWeight: 700 }}>{`-${formatCurrency(totalDriverDeduction)}`}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="pdf-right" style={{ fontWeight: 700 }}>Total Adjustments</td>
                      <td colSpan={2} className="pdf-right pdf-mono" style={{ fontWeight: 700 }}>{formatCurrency(totalAdjustments)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="pdf-right" style={{ fontWeight: 700 }}>Net Pay</td>
                      <td colSpan={2} className="pdf-right pdf-mono" style={{ fontWeight: 700 }}>{formatCurrency(finalPayable)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-8 pdf-section">
              <div className="overflow-x-auto">
                <table className="pdf-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '45%', fontSize: '12px' }}>Summary</th>
                      <th style={{ width: '35%', fontSize: '12px' }}>Date</th>
                      <th className="pdf-right" style={{ width: '20%', fontSize: '12px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: '12px', padding: '10px' }}>Settlement Total</td>
                      <td style={{ fontSize: '12px', padding: '10px' }} />
                      <td className="pdf-right pdf-mono" style={{ fontSize: '12px', padding: '10px' }}>{formatCurrency(grossPay)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: '12px', padding: '10px' }}>Driver Salary Deduction</td>
                      <td style={{ fontSize: '12px', padding: '10px' }} />
                      <td className="pdf-right pdf-mono" style={{ fontSize: '12px', padding: '10px' }}>-{formatCurrency(totalDriverDeduction)}</td>
                    </tr>
                    {previousDueAdded > 0 && (
                      <tr>
                        <td style={{ fontSize: '12px', padding: '10px' }}>Previous Month Due (Carry Forward)</td>
                        <td style={{ fontSize: '12px', padding: '10px' }} />
                        <td className="pdf-right pdf-mono" style={{ fontSize: '12px', padding: '10px' }}>{formatCurrency(previousDueAdded)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ fontSize: '12px', padding: '10px' }}>Manual Adjustments</td>
                      <td style={{ fontSize: '12px', padding: '10px' }} />
                      <td className="pdf-right pdf-mono" style={{ fontSize: '12px', padding: '10px' }}>{formatCurrency(manualAdjustmentSummary)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '16px', lineHeight: '20px' }}>Net Pay</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div className="pdf-mono" style={{ fontSize: '11px', color: '#334155' }}>
                          Pay Period: {fullDate(payPeriodFrom)} to {fullDate(payPeriodTo)}
                        </div>
                        <div className="pdf-mono" style={{ marginTop: '2px', fontSize: '11px', color: '#334155' }}>
                          Payment Date: {paymentDate ? fullDate(paymentDate) : '-'} • Receipt: {paymentNo || '-'}
                        </div>
                      </td>
                      <td className="pdf-right pdf-mono" style={{ padding: '12px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px' }}>{formatCurrency(finalPayable)}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
