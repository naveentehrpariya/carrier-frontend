import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Api from '../../../api/Api';
import Popup from '../../common/Popup';
import { UserContext } from '../../../context/AuthProvider';

export default function OwnerOperatorSalary() {
  const { selectedCurrency, setSelectedCurrency } = useContext(UserContext);
  const [ownerOperators, setOwnerOperators] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [salaryCurrency, setSalaryCurrency] = useState(String(selectedCurrency || 'CAD').toUpperCase());
  const [generatingForOwner, setGeneratingForOwner] = useState('');
  const [payslips, setPayslips] = useState([]);
  const [payslipsLoading, setPayslipsLoading] = useState(true);

  const [salaryPopupOpen, setSalaryPopupOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [popupMonth, setPopupMonth] = useState(new Date().getMonth() + 1);
  const [popupYear, setPopupYear] = useState(new Date().getFullYear());
  const [popupSalary, setPopupSalary] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupGenerating, setPopupGenerating] = useState(false);
  const [popupPayments, setPopupPayments] = useState([]);
  const [popupPaymentsLoading, setPopupPaymentsLoading] = useState(false);
  const [popupPayoutCurrency, setPopupPayoutCurrency] = useState('CAD');
  const [includePreviousDue, setIncludePreviousDue] = useState(true);
  const [expensePopupOpen, setExpensePopupOpen] = useState(false);
  const [expenseType, setExpenseType] = useState('deduction');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [editingExpenseRecord, setEditingExpenseRecord] = useState(null);

  const [paymentPopupOpen, setPaymentPopupOpen] = useState(false);
  const [paymentOwner, setPaymentOwner] = useState(null);
  const [paymentMonth, setPaymentMonth] = useState(new Date().getMonth() + 1);
  const [paymentYear, setPaymentYear] = useState(new Date().getFullYear());
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSalaryRecord, setPaymentSalaryRecord] = useState(null);
  const [paymentLookupLoading, setPaymentLookupLoading] = useState(false);
  const [paymentDueAmount, setPaymentDueAmount] = useState(0);
  const [paymentDueLoading, setPaymentDueLoading] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      options.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        label,
        month,
        year,
      });
    }
    return options;
  }, []);
  const currencyOptions = useMemo(
    () => ['USD', 'CAD', 'INR'],
    []
  );
  useEffect(() => {
    setSalaryCurrency(String(selectedCurrency || 'CAD').toUpperCase());
  }, [selectedCurrency]);
  const formatCurrency = useCallback((amount, currency = salaryCurrency) => {
    const code = String(currency || 'CAD').toUpperCase();
    return `${code} ${Number(amount || 0).toFixed(2)}`;
  }, [salaryCurrency]);
  const formatDistanceWithKm = useCallback((miles) => {
    const mi = Number(miles || 0);
    if (!(mi > 0)) return '—';
    const km = mi * 1.60934;
    return `${mi.toFixed(2)} mi (${km.toFixed(2)} km)`;
  }, []);

  const popupOrderTotals = useMemo(() => {
    const rows = Array.isArray(popupSalary?.orderBreakdown) ? popupSalary.orderBreakdown : [];
    const totalOrdersAmount = rows.reduce((sum, row) => sum + Number(row?.orderPrice || 0), 0);
    const totalSettlementAmount = rows.reduce((sum, row) => sum + Number(row?.settleAmount || 0), 0);
    const totalAdminProfit = rows.reduce((sum, row) => {
      const orderPrice = Number(row?.orderPrice || 0);
      const settleAmount = Number(row?.settleAmount || 0);
      return sum + Math.max(orderPrice - settleAmount, 0);
    }, 0);
    const totalDeductions = Number(popupSalary?.totalDriverDeduction || 0) + Number(popupSalary?.manualDeduction || 0);

    return {
      totalOrdersAmount: Number(popupSalary?.totalOrdersAmount || 0) || totalOrdersAmount,
      totalSettlementAmount: Number(popupSalary?.totalSettlementAmount || 0) || totalSettlementAmount,
      totalAdminProfit: Number(popupSalary?.totalAdminProfit || 0) || totalAdminProfit,
      totalDeductions,
    };
  }, [popupSalary]);

  const loadOwnerOperators = useCallback(async () => {
    setOwnersLoading(true);
    try {
      const qs = new URLSearchParams({ sortBy: 'fullName', sortOrder: 'asc' });
      const res = await Api.get(`/owner-operators/listings?${qs.toString()}`);
      if (res.data?.status) setOwnerOperators(res.data?.lists || []);
      else setOwnerOperators([]);
    } catch {
      setOwnerOperators([]);
    } finally {
      setOwnersLoading(false);
    }
  }, []);

  const loadReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const qs = new URLSearchParams({ month: String(salaryMonth), year: String(salaryYear), payoutCurrency: salaryCurrency });
      const res = await Api.get(`/owner-operators/reports/overview?${qs.toString()}`);
      if (res.data?.status) setReport(res.data);
      else setReport(null);
    } catch {
      setReport(null);
    } finally {
      setReportLoading(false);
    }
  }, [salaryMonth, salaryYear, salaryCurrency]);

  const loadPayslips = useCallback(async () => {
    setPayslipsLoading(true);
    try {
      const qs = new URLSearchParams({ month: String(salaryMonth), year: String(salaryYear), payoutCurrency: salaryCurrency });
      const res = await Api.get(`/owner-operators/salary/listings?${qs.toString()}`);
      setPayslips(Array.isArray(res.data?.lists) ? res.data.lists : []);
    } catch {
      setPayslips([]);
    } finally {
      setPayslipsLoading(false);
    }
  }, [salaryMonth, salaryYear, salaryCurrency]);

  useEffect(() => {
    loadOwnerOperators();
    loadReport();
    loadPayslips();
  }, [loadOwnerOperators, loadReport, loadPayslips]);

  const perfByOwnerId = useMemo(() => {
    const map = new Map();
    (report?.ownerPerformance || []).forEach((s) => {
      const id = s?.ownerOperatorId;
      if (id) map.set(String(id), s);
    });
    return map;
  }, [report]);

  const loadPopupSalary = useCallback(async (ownerId, month, year, payoutCurrency = popupPayoutCurrency, includePrevDue = includePreviousDue) => {
    if (!ownerId) return;
    setPopupLoading(true);
    try {
      const qs = new URLSearchParams({
        ownerOperatorId: String(ownerId),
        month: String(month),
        year: String(year),
        payoutCurrency: String(payoutCurrency || 'CAD'),
        includePreviousDue: String(includePrevDue),
      });
      const res = await Api.get(`/owner-operators/reports/breakdown?${qs.toString()}`);
      if (res.data?.status && res.data?.data) {
        setPopupSalary(res.data.data);
      } else {
        setPopupSalary(null);
      }
    } catch {
      setPopupSalary(null);
    } finally {
      setPopupLoading(false);
    }
  }, [popupPayoutCurrency]);

  const loadOwnerRecentPayments = useCallback(async (ownerId, month = popupMonth, year = popupYear) => {
    if (!ownerId) return;
    setPopupPaymentsLoading(true);
    try {
      const res = await Api.get(`/owner-operators/financial/${ownerId}`);
      if (res.data?.status) {
        const targetMonth = Number(month || 0);
        const targetYear = Number(year || 0);
        const rows = (res.data?.records || [])
          .filter(
            (r) => {
              const recMonth = Number(r?.month || 0);
              const recYear = Number(r?.year || 0);
              const isSalaryRecordType = r?.type === 'SALARY_PAYMENT' || r?.type === 'ADJUSTMENT';
              const createdAt = r?.createdAt ? new Date(r.createdAt) : null;
              const fallbackMonth = createdAt ? (createdAt.getMonth() + 1) : 0;
              const fallbackYear = createdAt ? createdAt.getFullYear() : 0;
              const sameMonth =
                (recMonth === targetMonth && recYear === targetYear) ||
                ((recMonth === 0 || recYear === 0) && fallbackMonth === targetMonth && fallbackYear === targetYear);
              return isSalaryRecordType && sameMonth;
            }
          )
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPopupPayments(rows);
      } else {
        setPopupPayments([]);
      }
    } catch {
      setPopupPayments([]);
    } finally {
      setPopupPaymentsLoading(false);
    }
  }, [popupMonth, popupYear]);

  const loadPaymentSalaryRecord = useCallback(async (ownerId, month, year) => {
    if (!ownerId) return;
    setPaymentLookupLoading(true);
    try {
      const qs = new URLSearchParams({
        ownerOperatorId: String(ownerId),
        month: String(month),
        year: String(year),
      });
      const res = await Api.get(`/owner-operators/salary/listings?${qs.toString()}`);
      if (res.data?.status && Array.isArray(res.data?.lists) && res.data.lists.length > 0) {
        setPaymentSalaryRecord(res.data.lists[0]);
      } else {
        setPaymentSalaryRecord(null);
      }
    } catch {
      setPaymentSalaryRecord(null);
    } finally {
      setPaymentLookupLoading(false);
    }
  }, []);

  const loadPaymentDuePreview = useCallback(async (ownerId, month, year, payoutCurrency = popupPayoutCurrency) => {
    if (!ownerId) return;
    setPaymentDueLoading(true);
    try {
      const qs = new URLSearchParams({
        ownerOperatorId: String(ownerId),
        month: String(month),
        year: String(year),
        payoutCurrency: String(payoutCurrency || 'CAD'),
        includePreviousDue: String(includePreviousDue),
      });
      const res = await Api.get(`/owner-operators/reports/breakdown?${qs.toString()}`);
      if (res.data?.status && res.data?.data) {
        setPaymentDueAmount(Number(res.data.data.dueAmount ?? res.data.data.finalPayable ?? 0));
      } else {
        setPaymentDueAmount(0);
      }
    } catch {
      setPaymentDueAmount(0);
    } finally {
      setPaymentDueLoading(false);
    }
  }, [includePreviousDue, popupPayoutCurrency]);

  const loadPopupFxRates = useCallback(async (month, year, payoutCurrency = popupPayoutCurrency) => {
    try {
      const qs = new URLSearchParams({
        month: String(month),
        year: String(year),
        targetCurrency: String(payoutCurrency || 'CAD'),
      });
      await Api.get(`/owner-operators/fx-rates?${qs.toString()}`);
    } catch {
      // Keep flow resilient if FX preview fetch fails.
    }
  }, [popupPayoutCurrency]);

  const autoSyncPopupFxRates = useCallback(async (month, year, payoutCurrency = popupPayoutCurrency) => {
    try {
      await Api.post('/owner-operators/fx-rates/auto', {
        month,
        year,
        targetCurrency: String(payoutCurrency || 'CAD').toUpperCase(),
        sourceCurrencies: currencyOptions.filter((code) => code !== String(payoutCurrency || 'CAD').toUpperCase()),
      });
    } catch {
      await loadPopupFxRates(month, year, payoutCurrency);
    }
  }, [popupPayoutCurrency, currencyOptions, loadPopupFxRates]);

  const openSalaryPopup = async (owner, presetCurrency = salaryCurrency) => {
    setSelectedOwner(owner);
    setPopupMonth(salaryMonth);
    setPopupYear(salaryYear);
    setPopupSalary(null);
    setPopupPayments([]);
    setPopupLoading(true);
    setPopupPaymentsLoading(true);
    setIncludePreviousDue(true);
    const initialCurrency = String(presetCurrency || salaryCurrency || 'CAD').toUpperCase();
    setPopupPayoutCurrency(initialCurrency);
    setSalaryPopupOpen(true);
    await autoSyncPopupFxRates(salaryMonth, salaryYear, initialCurrency);
    await Promise.all([
      loadPopupSalary(owner?._id, salaryMonth, salaryYear, initialCurrency),
      loadOwnerRecentPayments(owner?._id, salaryMonth, salaryYear),
    ]);
  };

  const onTopMonthChange = (value) => {
    const selected = monthOptions.find((opt) => opt.value === value);
    if (!selected) return;
    setSalaryMonth(selected.month);
    setSalaryYear(selected.year);
  };

  const onPopupMonthChange = async (value) => {
    const selected = monthOptions.find((opt) => opt.value === value);
    if (!selected || !selectedOwner?._id) return;
    setPopupMonth(selected.month);
    setPopupYear(selected.year);
    await autoSyncPopupFxRates(selected.month, selected.year, popupPayoutCurrency);
    await loadPopupSalary(selectedOwner._id, selected.month, selected.year, popupPayoutCurrency);
    await loadOwnerRecentPayments(selectedOwner._id, selected.month, selected.year);
  };

  const onIncludePrevDueChange = async (checked) => {
    setIncludePreviousDue(checked);
    if (selectedOwner?._id) {
      await loadPopupSalary(selectedOwner._id, popupMonth, popupYear, popupPayoutCurrency, checked);
    }
  };

  const onPopupCurrencyChange = async (currency) => {
    if (!selectedOwner?._id) return;
    const target = String(currency || 'CAD').toUpperCase();
    setPopupPayoutCurrency(target);
    setSalaryCurrency(target);
    await autoSyncPopupFxRates(popupMonth, popupYear, target);
    await loadPopupSalary(selectedOwner._id, popupMonth, popupYear, target);
  };

  const openPaymentPopup = async (owner, salaryRecord = null) => {
    setPaymentOwner(owner);
    setPaymentAmount('');
    setPaymentNotes('');
    const selectedMonth = Number(salaryRecord?.month || salaryMonth);
    const selectedYear = Number(salaryRecord?.year || salaryYear);
    setPaymentMonth(selectedMonth);
    setPaymentYear(selectedYear);
    setPaymentSalaryRecord(salaryRecord || null);
    setPaymentDueAmount(0);
    setPaymentPopupOpen(true);
    await Promise.all([
      loadPaymentSalaryRecord(owner?._id, selectedMonth, selectedYear),
      loadPaymentDuePreview(owner?._id, selectedMonth, selectedYear, String(salaryRecord?.currency || popupPayoutCurrency || salaryCurrency)),
    ]);
  };

  const onPaymentMonthChange = async (value) => {
    const selected = monthOptions.find((opt) => opt.value === value);
    if (!selected || !paymentOwner?._id) return;
    setPaymentMonth(selected.month);
    setPaymentYear(selected.year);
    await Promise.all([
      loadPaymentSalaryRecord(paymentOwner._id, selected.month, selected.year),
      loadPaymentDuePreview(paymentOwner._id, selected.month, selected.year, popupPayoutCurrency),
    ]);
  };

  const generateOwnerSalary = async (owner) => {
    if (!owner?._id) return;
    setGeneratingForOwner(owner._id);
    try {
      const res = await Api.post('/owner-operators/salary/generate', {
        ownerOperatorId: owner._id,
        month: salaryMonth,
        year: salaryYear,
        payoutCurrency: salaryCurrency,
      });
      if (res.data?.status) {
        toast.success(`Payslip generated for ${owner.fullName}`);
        loadReport();
        loadPayslips();
        if (selectedOwner?._id === owner._id && salaryPopupOpen) {
          loadPopupSalary(owner._id, popupMonth, popupYear, popupPayoutCurrency);
        }
      } else {
        toast.error(res.data?.message || 'Failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setGeneratingForOwner('');
    }
  };

  const generateSalaryFromPopup = async () => {
    if (!selectedOwner?._id) return;
    setPopupGenerating(true);
    try {
      const res = await Api.post('/owner-operators/salary/generate', {
        ownerOperatorId: selectedOwner._id,
        month: popupMonth,
        year: popupYear,
        payoutCurrency: popupPayoutCurrency,
        includePreviousDue,
      });
      if (res.data?.status) {
        toast.success('Payslip generated');
        loadReport();
        loadPayslips();
        loadPopupSalary(selectedOwner._id, popupMonth, popupYear, popupPayoutCurrency);
        loadOwnerRecentPayments(selectedOwner._id, popupMonth, popupYear);
      } else {
        toast.error(res.data?.message || 'Failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setPopupGenerating(false);
    }
  };

  const openExpensePopup = (type) => {
    setEditingExpenseRecord(null);
    setExpenseType(type);
    setExpenseAmount('');
    setExpenseNotes('');
    setExpensePopupOpen(true);
  };

  const openEditExpensePopup = (record) => {
    if (!record?._id || record?.type !== 'ADJUSTMENT') return;
    setEditingExpenseRecord(record);
    setExpenseType(record?.meta?.expenseType === 'addition' ? 'addition' : 'deduction');
    setExpenseAmount(String(Number(record?.amount || 0)));
    setExpenseNotes(String(record?.notes || ''));
    setExpensePopupOpen(true);
  };

  const removeExpenseEntry = async (record) => {
    if (!record?._id || !selectedOwner?._id) return;
    const isSyntheticRecord = String(record?._id || '').startsWith('synthetic-');
    if (isSyntheticRecord || record?.type !== 'ADJUSTMENT') return;
    const ok = window.confirm('Delete this adjustment record?');
    if (!ok) return;
    try {
      const res = await Api.post(`/owner-operators/salary/expense/remove/${record._id}`, {});
      if (res.data?.status) {
        toast.success('Expense deleted');
        loadReport();
        loadPayslips();
        loadPopupSalary(selectedOwner._id, popupMonth, popupYear, popupPayoutCurrency);
        loadOwnerRecentPayments(selectedOwner._id, popupMonth, popupYear);
      } else {
        toast.error(res.data?.message || 'Failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  const submitExpenseEntry = async () => {
    if (!selectedOwner?._id) return;
    const amount = Number(expenseAmount || 0);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!String(expenseNotes || '').trim()) {
      toast.error('Notes are required');
      return;
    }
    setExpenseSaving(true);
    try {
      const qs = new URLSearchParams({
        ownerOperatorId: String(selectedOwner._id),
        month: String(popupMonth),
        year: String(popupYear),
      });
      let listRes = await Api.get(`/owner-operators/salary/listings?${qs.toString()}`);
      let salaryRecord = listRes.data?.lists?.[0] || null;
      if (!salaryRecord?._id || String(salaryRecord?.currency || '').toUpperCase() !== String(popupPayoutCurrency || 'CAD').toUpperCase()) {
        const generateRes = await Api.post('/owner-operators/salary/generate', {
          ownerOperatorId: selectedOwner._id,
          month: popupMonth,
          year: popupYear,
          payoutCurrency: popupPayoutCurrency,
        });
        if (!generateRes.data?.status) {
          toast.error(generateRes.data?.message || 'Unable to generate payslip');
          setExpenseSaving(false);
          return;
        }
        listRes = await Api.get(`/owner-operators/salary/listings?${qs.toString()}`);
        salaryRecord = listRes.data?.lists?.[0] || null;
      }
      if (!salaryRecord?._id) {
        toast.error('Payslip is unavailable for selected month');
        setExpenseSaving(false);
        return;
      }
      const res = editingExpenseRecord?._id
        ? await Api.post(`/owner-operators/salary/expense/update/${editingExpenseRecord._id}`, {
            amount,
            notes: expenseNotes,
          })
        : await Api.post(`/owner-operators/salary/expense/${salaryRecord._id}`, {
            expenseType,
            amount,
            currency: popupPayoutCurrency,
            notes: expenseNotes,
          });
      if (res.data?.status) {
        toast.success(editingExpenseRecord?._id ? 'Expense updated' : 'Expense added');
        setExpensePopupOpen(false);
        setEditingExpenseRecord(null);
        loadReport();
        loadPayslips();
        loadPopupSalary(selectedOwner._id, popupMonth, popupYear, popupPayoutCurrency);
        loadOwnerRecentPayments(selectedOwner._id, popupMonth, popupYear);
      } else {
        toast.error(res.data?.message || 'Failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setExpenseSaving(false);
    }
  };

  const submitSalaryPayment = async () => {
    if (!paymentOwner?._id) {
      toast.error('Owner operator is required');
      return;
    }
    const effectiveDue = Number(paymentSalaryRecord?.dueAmount ?? paymentDueAmount ?? 0);
    if (effectiveDue <= 0) {
      toast.error('No due amount found for selected month');
      return;
    }
    const amount = Number(paymentAmount || 0);
    if (!amount || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }
    if (amount > effectiveDue) {
      toast.error('Paid amount cannot be greater than due amount');
      return;
    }
    setPaymentSaving(true);
    try {
      let salaryRecord = paymentSalaryRecord;
      if (!salaryRecord?._id || String(salaryRecord?.currency || '').toUpperCase() !== String(popupPayoutCurrency || 'CAD').toUpperCase()) {
        const generateRes = await Api.post('/owner-operators/salary/generate', {
          ownerOperatorId: paymentOwner._id,
          month: paymentMonth,
          year: paymentYear,
          payoutCurrency: popupPayoutCurrency,
        });
        if (!generateRes.data?.status) {
          toast.error(generateRes.data?.message || 'Unable to generate salary for payment');
          setPaymentSaving(false);
          return;
        }
        const qs = new URLSearchParams({
          ownerOperatorId: String(paymentOwner._id),
          month: String(paymentMonth),
          year: String(paymentYear),
        });
        const listRes = await Api.get(`/owner-operators/salary/listings?${qs.toString()}`);
        salaryRecord = listRes.data?.lists?.[0] || null;
      }
      if (!salaryRecord?._id) {
        toast.error('Salary record is still unavailable for selected month');
        setPaymentSaving(false);
        return;
      }
      const res = await Api.post(`/owner-operators/salary/pay/${salaryRecord._id}`, {
        amount,
        currency: popupPayoutCurrency,
        notes: paymentNotes || 'Manual payment entry',
      });
      if (res.data?.status) {
        toast.success('Payment updated');
        setPaymentPopupOpen(false);
        loadReport();
        loadPayslips();
        if (selectedOwner?._id === paymentOwner._id && salaryPopupOpen) {
          loadPopupSalary(selectedOwner._id, popupMonth, popupYear, popupPayoutCurrency);
          loadOwnerRecentPayments(selectedOwner._id, popupMonth, popupYear);
        }
      } else {
        toast.error(res.data?.message || 'Failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setPaymentSaving(false);
    }
  };

  const removePayslip = async (slip) => {
    if (!slip?._id) return;
    const ownerName = slip?.ownerOperator?.fullName || 'this owner operator';
    const ok = window.confirm(`Delete payslip for ${ownerName} (${slip.month}/${slip.year})? This will remove related payment/adjustment records.`);
    if (!ok) return;
    try {
      const res = await Api.get(`/owner-operators/salary/remove/${slip._id}`);
      if (res.data?.status) {
        toast.success('Payslip deleted');
        loadPayslips();
        loadReport();
        if (selectedOwner?._id && selectedOwner?._id === slip?.ownerOperator?._id && salaryPopupOpen) {
          loadPopupSalary(selectedOwner._id, popupMonth, popupYear, popupPayoutCurrency);
          loadOwnerRecentPayments(selectedOwner._id, popupMonth, popupYear);
        }
      } else {
        toast.error(res.data?.message || 'Failed to delete payslip');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete payslip');
    }
  };

  const selectedPaymentDue = Number(paymentSalaryRecord?.dueAmount ?? paymentDueAmount ?? 0);
  const enteredPaymentAmount = Number(paymentAmount || 0);
  const remainingAfterEntry = Math.max(selectedPaymentDue - enteredPaymentAmount, 0);
  const popupDisplayRecords = useMemo(() => {
    const rows = Array.isArray(popupPayments) ? [...popupPayments] : [];
    
    // Add synthetic Previous Due record if included and present
    if (includePreviousDue && Number(popupSalary?.previousDueAdded || 0) > 0) {
      rows.unshift({
        _id: `synthetic-prev-due-${popupMonth}-${popupYear}`,
        createdAt: new Date(popupYear, Math.max(popupMonth - 1, 0), 1).toISOString(),
        month: popupMonth,
        year: popupYear,
        type: 'ADJUSTMENT',
        meta: { expenseType: 'addition' },
        amount: Number(popupSalary.previousDueAdded),
        paymentStatus: popupSalary?.paymentStatus || 'pending',
        notes: 'Carry-forward from previous month due',
        isSynthetic: true,
      });
    }

    const hasDriverDeductionRecord = rows.some((r) => r?.type === 'DRIVER_DEDUCTION');
    const hasDeductionRecord = rows.some((r) => r?.type === 'ADJUSTMENT' && r?.meta?.expenseType === 'deduction' && !r?.isSynthetic);
    const hasAdditionRecord = rows.some((r) => r?.type === 'ADJUSTMENT' && r?.meta?.expenseType === 'addition' && !r?.isSynthetic);
    const totalDriverDeduction = Number(popupSalary?.totalDriverDeduction || 0);
    const manualDeduction = Number(popupSalary?.manualDeduction || 0);
    const manualAddition = Number(popupSalary?.manualAddition || 0);
    if (!hasDriverDeductionRecord && totalDriverDeduction > 0) {
      rows.unshift({
        _id: `synthetic-driver-deduction-${popupMonth}-${popupYear}`,
        createdAt: new Date(popupYear, Math.max(popupMonth - 1, 0), 1).toISOString(),
        month: popupMonth,
        year: popupYear,
        type: 'DRIVER_DEDUCTION',
        amount: totalDriverDeduction,
        paymentStatus: popupSalary?.paymentStatus || 'pending',
        notes: 'Auto-calculated from order driver cost',
        meta: { expenseType: 'deduction' },
      });
    }
    if (!hasDeductionRecord && manualDeduction > 0) {
      rows.unshift({
        _id: `synthetic-deduction-${popupMonth}-${popupYear}`,
        createdAt: new Date(popupYear, Math.max(popupMonth - 1, 0), 1).toISOString(),
        month: popupMonth,
        year: popupYear,
        type: 'ADJUSTMENT',
        amount: manualDeduction,
        paymentStatus: popupSalary?.paymentStatus || 'pending',
        notes: 'Applied from payslip deduction',
        meta: { expenseType: 'deduction' },
      });
    }
    if (!hasAdditionRecord && manualAddition > 0) {
      rows.unshift({
        _id: `synthetic-addition-${popupMonth}-${popupYear}`,
        createdAt: new Date(popupYear, Math.max(popupMonth - 1, 0), 1).toISOString(),
        month: popupMonth,
        year: popupYear,
        type: 'ADJUSTMENT',
        amount: manualAddition,
        paymentStatus: popupSalary?.paymentStatus || 'pending',
        notes: 'Applied from payslip addition',
        meta: { expenseType: 'addition' },
      });
    }
    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [popupPayments, popupSalary, popupMonth, popupYear, includePreviousDue]);

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-white/5 bg-[#11131A] p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <h2 className="text-white text-2xl font-bold">Owner Operator Payslips</h2>
            <p className="text-sm text-gray-400 mt-1">Select month, generate payslips, and manage adjustments from one screen.</p>
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="input-sm min-w-[170px]"
              value={`${salaryYear}-${String(salaryMonth).padStart(2, '0')}`}
              onChange={(e) => onTopMonthChange(e.target.value)}
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="input-sm min-w-[100px]"
              value={salaryCurrency}
              onChange={(e) => {
                const next = String(e.target.value || 'CAD').toUpperCase();
                setSalaryCurrency(next);
                setSelectedCurrency(next);
              }}
            >
              {currencyOptions.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-400">
          Workflow: <span className="text-white">Generate Payslip</span> → <span className="text-white">Add Extra / Deduction</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
          <div className="text-[10px] uppercase text-gray-500">Owner Operated Orders</div>
          <div className="text-white text-xl font-bold">{reportLoading ? '...' : report?.metrics?.ownerOperatedOrders || 0}</div>
        </div>
        <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
          <div className="text-[10px] uppercase text-gray-500">Total Owner Profit</div>
          <div className="text-white text-xl font-bold">{formatCurrency(report?.metrics?.totalOwnerProfit || 0, report?.currency || salaryCurrency)}</div>
        </div>
        <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
          <div className="text-[10px] uppercase text-gray-500">Driver Deductions</div>
          <div className="text-white text-xl font-bold">{formatCurrency(report?.metrics?.totalDriverDeduction || 0, report?.currency || salaryCurrency)}</div>
        </div>
        <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
          <div className="text-[10px] uppercase text-gray-500">Final Payable</div>
          <div className="text-white text-xl font-bold">{formatCurrency(report?.metrics?.totalFinalPayable || 0, report?.currency || salaryCurrency)}</div>
        </div>
      </div>

      <div className="mt-5 border border-white/5 rounded-2xl overflow-auto bg-[#11131A]">
        <table className="min-w-[1040px] w-full text-sm text-white">
          <thead className="bg-[#12161d] text-[#8A8FA3]">
            <tr>
              <th className="px-4 py-3 text-left">Owner Operator</th>
              <th className="px-4 py-3 text-right">Orders</th>
              <th className="px-4 py-3 text-right">Order / Settlement</th>
              <th className="px-4 py-3 text-right">Profit / Deduction</th>
              <th className="px-4 py-3 text-right">Final Payable</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {ownersLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading owner operators...</td>
              </tr>
            )}
            {!ownersLoading && ownerOperators.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No owner operators found</td>
              </tr>
            )}
            {!ownersLoading &&
              ownerOperators.map((owner) => {
                const perf = perfByOwnerId.get(String(owner._id));
                return (
              <tr key={owner._id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <div className="font-semibold">{owner?.fullName || '—'}</div>
                  <div className="text-xs text-gray-400">{owner?.ownerOperatorId || ''}</div>
                </td>
                <td className="px-4 py-3 text-right">{perf?.orders || 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="text-xs text-gray-300">
                    <span className="text-gray-500">Order:</span>{' '}
                    <span className="text-white">{formatCurrency(perf?.revenue || 0, report?.currency || salaryCurrency)}</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    <span className="text-gray-500">Settle:</span>{' '}
                    <span className="text-white">{formatCurrency(perf?.settleAmount || 0, report?.currency || salaryCurrency)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="text-xs text-gray-300">
                    <span className="text-gray-500">Profit:</span>{' '}
                    <span className="text-white">{formatCurrency(perf?.ownerProfit || 0, report?.currency || salaryCurrency)}</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    <span className="text-gray-500">Deduct:</span>{' '}
                    <span className="text-rose-300">{formatCurrency(perf?.driverDeduction || 0, report?.currency || salaryCurrency)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">{formatCurrency(perf?.finalPayable || 0, report?.currency || salaryCurrency)}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-lg ${
                      Number(perf?.orders || 0) > 0 ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {Number(perf?.orders || 0) > 0 ? 'ready' : 'no_orders'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn xs bg-indigo-600 text-white" title="Open monthly details" onClick={() => openSalaryPopup(owner)}>
                      Details
                    </button>
                    <button
                      className="btn xs main-btn text-black font-semibold"
                      onClick={() => generateOwnerSalary(owner)}
                      disabled={generatingForOwner === owner._id}
                    >
                      {generatingForOwner === owner._id ? 'Generating...' : 'Generate Payslip'}
                    </button>
                    {false && (
                      <button className="btn xs bg-emerald-700 text-white" title="Mark payment for selected month" onClick={() => openPaymentPopup(owner)}>
                        Mark Payment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 border border-white/5 rounded-2xl overflow-auto bg-[#11131A]">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <h4 className="text-white font-semibold">Generated Payslips ({monthOptions.find((m) => m.month === salaryMonth && m.year === salaryYear)?.label || ''})</h4>
          <span className="text-xs text-gray-400">{payslipsLoading ? 'Loading...' : `${payslips.length} record(s)`}</span>
        </div>
        <table className="min-w-[860px] w-full text-sm text-white">
          <thead className="bg-[#12161d] text-[#8A8FA3]">
            <tr>
              <th className="px-4 py-3 text-left">Owner Operator</th>
              <th className="px-4 py-3 text-left">Pay Summary</th>
              <th className="px-4 py-3 text-left">Adjustments</th>
              <th className="px-4 py-3 text-left">Settlement</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {payslipsLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading payslips...</td>
              </tr>
            )}
            {!payslipsLoading && payslips.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No payslips generated for selected month</td>
              </tr>
            )}
            {!payslipsLoading && payslips.map((slip) => (
              <tr key={slip._id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <div className="font-semibold">{slip?.ownerOperator?.fullName || '—'}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{slip?.ownerOperator?.ownerOperatorId || ''}</span>
                    <span className={`px-2 py-0.5 text-[10px] rounded-lg capitalize ${
                      slip?.paymentStatus === 'paid'
                        ? 'bg-green-500/20 text-green-300'
                        : slip?.paymentStatus === 'partial'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-gray-700 text-gray-300'
                    }`}>
                      {slip?.paymentStatus || 'pending'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-300">Base <span className="text-white">{formatCurrency(slip?.basePayable || 0, slip?.currency || salaryCurrency)}</span></div>
                  <div className="text-xs text-gray-300">Final <span className="text-white">{formatCurrency(slip?.finalPayable || 0, slip?.currency || salaryCurrency)}</span></div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-300">+Prev <span className="text-white">{formatCurrency(slip?.previousDueAdded || 0, slip?.currency || salaryCurrency)}</span></div>
                  <div className="text-xs text-gray-300">+Add <span className="text-white">{formatCurrency(slip?.manualAddition || 0, slip?.currency || salaryCurrency)}</span></div>
                  <div className="text-xs text-gray-300">-Deduct <span className="text-rose-300">{formatCurrency(slip?.manualDeduction || 0, slip?.currency || salaryCurrency)}</span></div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-300">Paid <span className="text-white">{formatCurrency(slip?.paidAmount || 0, slip?.currency || salaryCurrency)}</span></div>
                  <div className="text-xs text-gray-300">Due <span className="text-white">{formatCurrency(slip?.dueAmount || 0, slip?.currency || salaryCurrency)}</span></div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-grid grid-cols-2 gap-1 w-fit ml-auto">
                    <button
                      className="h-7 min-w-[98px] px-1 rounded-md text-[11px] font-semibold bg-indigo-600 text-white"
                      onClick={() => openSalaryPopup(slip?.ownerOperator, slip?.currency)}
                    >
                      Details
                    </button>
                    <button
                      className="h-7 min-w-[98px] px-1 rounded-md text-[11px] font-semibold bg-rose-700 text-white"
                      onClick={() => removePayslip(slip)}
                    >
                      Delete
                    </button>
                    <button
                      className="h-7 min-w-[98px] px-1 rounded-md text-[11px] font-semibold bg-emerald-700 text-white"
                      onClick={() => openPaymentPopup(slip?.ownerOperator, slip)}
                      disabled={Number(slip?.dueAmount || 0) <= 0}
                    >
                      {Number(slip?.dueAmount || 0) <= 0 ? 'Paid' : 'Mark Payment'}
                    </button>
                    <Link
                      to={`/accounts/owner-operator-statement/${slip?._id}`}
                      state={{ slip }}
                      className="h-7 min-w-[98px] px-1 rounded-md text-[11px] font-semibold bg-slate-700 text-white inline-flex items-center justify-center"
                    >
                      Preview / PDF
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Popup open={salaryPopupOpen} onClose={() => setSalaryPopupOpen(false)} showTrigger={false} size="md:max-w-5xl" space="p-6" bg="bg-black">
        <div className="text-white pr-8">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="text-xl font-bold">Generate Owner Payslip</h3>
              <p className="text-sm text-gray-400 mt-1">
                {selectedOwner?.fullName || 'Owner Operator'} ({selectedOwner?.ownerOperatorId || '—'})
              </p>
            </div>
            <div className="flex gap-2 items-center pr-2 flex-wrap justify-end">
              <select
                className="bg-black border border-gray-700 rounded-[14px] px-4 h-11 min-w-[180px] text-white focus:outline-none focus:border-main"
                value={`${popupYear}-${String(popupMonth).padStart(2, '0')}`}
                onChange={(e) => onPopupMonthChange(e.target.value)}
                disabled={popupLoading}
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                className="bg-black border border-gray-700 rounded-[14px] px-4 h-11 min-w-[120px] text-white focus:outline-none focus:border-main"
                value={popupPayoutCurrency}
                onChange={(e) => onPopupCurrencyChange(e.target.value)}
                disabled={popupLoading || popupGenerating}
              >
                {currencyOptions.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <button
                className="btn sm main-btn text-black font-bold h-11 min-w-[140px] whitespace-nowrap flex items-center justify-center"
                onClick={generateSalaryFromPopup}
                disabled={popupGenerating}
              >
                {popupGenerating ? 'Generating...' : 'Generate Payslip'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mt-4">
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
              <div className="text-[10px] uppercase text-gray-500">Orders</div>
              <div className="text-white text-lg font-bold">{popupSalary?.totalOrders || 0}</div>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
              <div className="text-[10px] uppercase text-gray-500">Orders Amount</div>
              <div className="text-white text-lg font-bold">{formatCurrency(popupOrderTotals.totalOrdersAmount || 0, popupSalary?.currency || popupPayoutCurrency)}</div>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
              <div className="text-[10px] uppercase text-gray-500">Settlement Amount</div>
              <div className="text-white text-lg font-bold">{formatCurrency(popupOrderTotals.totalSettlementAmount || 0, popupSalary?.currency || popupPayoutCurrency)}</div>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
              <div className="text-[10px] uppercase text-gray-500">Total Deduction</div>
              <div className="text-white text-lg font-bold">{formatCurrency(popupOrderTotals.totalDeductions || 0, popupSalary?.currency || popupPayoutCurrency)}</div>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
              <div className="text-[10px] uppercase text-gray-500">Admin Profit</div>
              <div className="text-white text-lg font-bold">{formatCurrency(popupOrderTotals.totalAdminProfit || 0, popupSalary?.currency || popupPayoutCurrency)}</div>
            </div>
            <div className="bg-[#11131A] border border-white/5 rounded-xl p-3 lg:p-4">
              <div className="text-[10px] uppercase text-gray-500">Final Payable</div>
              <div className="text-white text-lg font-bold">{formatCurrency(popupSalary?.finalPayable || 0, popupSalary?.currency || popupPayoutCurrency)}</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-300">
            Previous Due Applied: <span className="text-white">{formatCurrency(popupSalary?.previousDueAdded || 0, popupSalary?.currency || popupPayoutCurrency)}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Tip: If previous due was already settled separately, uncheck carry-forward before generating.
          </div>
          <div className="flex justify-between gap-3 mt-4">
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                id="include-prev-due"
                type="checkbox" className='text-normal'
                checked={includePreviousDue}
                onChange={(e) => onIncludePrevDueChange(e.target.checked)}
              />
              <label htmlFor="include-prev-due" className="text-normal text-gray-300">
                Include previous due in generated payslip
              </label>
            </div>
            <div className="flex gap-2 justify-end items-center">
              <button className=" whitespace-nowrap btn bg-emerald-700 text-white w-full !h-9 !min-h-0 !px-4 !py-1.5 !text-[13px] rounded-xl" onClick={() => openExpensePopup('addition')}>
                Add Extra
              </button>
              <button className=" whitespace-nowrap btn bg-rose-700 text-white w-full !h-9 !min-h-0 !px-4 !py-1.5 !text-[13px] rounded-xl" onClick={() => openExpensePopup('deduction')}>
                Add Deduction
              </button>
            </div>
          </div>

          <div className="mt-4 border border-white/5 rounded-xl overflow-auto">
            <div className="bg-gray-900 p-3 border-b border-white/5">
              <h4 className="text-sm font-semibold text-white">Records (Deductions / Additions / Payments)</h4>
            </div>
            <table className="min-w-[860px] w-full text-sm text-white">
              <thead className="bg-[#12161d] text-[#8A8FA3]">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {popupPaymentsLoading && (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={`records-skeleton-${idx}`} className="border-t border-white/5 animate-pulse">
                      <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-white/10" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-white/10" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-white/10" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-4 w-24 rounded bg-white/10 ml-auto" /></td>
                      <td className="px-4 py-3 text-center"><div className="h-5 w-16 rounded-full bg-white/10 mx-auto" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-48 rounded bg-white/10" /></td>
                      <td className="px-4 py-3 text-right"><div className="h-4 w-10 rounded bg-white/10 ml-auto" /></td>
                    </tr>
                  ))
                )}
                {!popupPaymentsLoading && popupDisplayRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No records found</td>
                  </tr>
                )}
                {!popupPaymentsLoading && popupDisplayRecords.map((p) => {
                  const isSyntheticRecord = String(p?._id || '').startsWith('synthetic-');
                  const createdAtDate = p?.createdAt ? new Date(p.createdAt) : null;
                  const showDate = !isSyntheticRecord && createdAtDate && !Number.isNaN(createdAtDate.getTime());
                  const canEditExpense = !isSyntheticRecord && p?.type === 'ADJUSTMENT';
                  return (
                  <tr key={p._id} className="border-t border-white/5">
                    <td className="px-4 py-3">{showDate ? createdAtDate.toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">{`${p.month || '-'} / ${p.year || '-'}`}</td>
                    <td className="px-4 py-3">
                        {p?.type === 'SALARY_PAYMENT'
                          ? 'Payment'
                          : p?.type === 'DRIVER_DEDUCTION'
                            ? 'Driver Deduction'
                            : (p?.meta?.expenseType === 'addition' ? 'Extra Addition' : 'Deduction')}
                    </td>
                      <td className={`px-4 py-3 text-right ${
                        (p?.type === 'DRIVER_DEDUCTION') || (p?.type === 'ADJUSTMENT' && p?.meta?.expenseType === 'deduction')
                          ? 'text-rose-300'
                          : ''
                      }`}>
                        {(p?.type === 'DRIVER_DEDUCTION') || (p?.type === 'ADJUSTMENT' && p?.meta?.expenseType === 'deduction')
                          ? '-'
                          : '+'}{formatCurrency(p.amount || 0, popupSalary?.currency || popupPayoutCurrency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 text-xs rounded-lg bg-gray-700 text-gray-200 capitalize">
                        {p.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[320px]">
                      <div
                        className="text-sm text-white/95 overflow-hidden"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word',
                        }}
                        title={p.notes || '—'}
                      >
                        {p.notes || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canEditExpense ? (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            className="h-7 min-w-[62px] px-2 rounded-md text-[11px] font-semibold bg-indigo-600 text-white"
                            onClick={() => openEditExpensePopup(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="h-7 min-w-[62px] px-2 rounded-md text-[11px] font-semibold bg-rose-700 text-white"
                            onClick={() => removeExpenseEntry(p)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 border border-white/5 rounded-xl overflow-auto">
            <div className="bg-gray-900 p-3 border-b border-white/5">
              <h4 className="text-sm font-semibold text-white">Order Breakdown</h4>
            </div>
            <table className="min-w-[860px] w-full text-sm text-white">
              <thead className="bg-[#12161d] text-[#8A8FA3]">
                <tr>
                  <th className="px-4 py-3 text-left">Order No</th>
                  <th className="px-4 py-3 text-left">Order Financials</th>
                  <th className="px-4 py-3 text-left">Driver Run Details</th>
                  <th className="px-4 py-3 text-right">Payable</th>
                </tr>
              </thead>
              <tbody>
                {popupLoading && (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={`order-breakdown-skeleton-${idx}`} className="border-t border-white/5 animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-4 w-20 rounded bg-white/10" />
                        <div className="h-4 w-14 rounded bg-white/10 mt-2" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-4 w-28 rounded bg-white/10" />
                          <div className="h-4 w-24 rounded bg-white/10" />
                          <div className="h-4 w-28 rounded bg-white/10" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-4 w-36 rounded bg-white/10" />
                          <div className="h-4 w-28 rounded bg-white/10" />
                          <div className="h-4 w-32 rounded bg-white/10" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="h-5 w-24 rounded bg-white/10 ml-auto" />
                      </td>
                    </tr>
                  ))
                )}
                {!popupLoading && !popupSalary && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      Payslip has not been generated for this month. Select month and generate payslip.
                    </td>
                  </tr>
                )}
                {!popupLoading && popupSalary && (!popupSalary.orderBreakdown || popupSalary.orderBreakdown.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No owner-operated orders were found for the selected month.
                    </td>
                  </tr>
                )}
                {!popupLoading && (popupSalary?.orderBreakdown || []).map((order) => (
                  <tr key={String(order.order)} className="border-t border-white/5">
                    <td className="px-4 py-3">

                      {order?.order ? (
                        <Link className="text-main hover:underline font-semibold" to={`/view/order/${order.order}`} target="_blank" rel="noreferrer">
                          {order?.serial_no ? `#${order.serial_no}` : 'View Order'}
                        </Link>
                      ) : (
                        '—'
                      )}
                      <p className="font-semibold">
                       {order?.customer_order_no ? `#${order.customer_order_no}` : '--'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">
                        <div className='grid grid-cols-2 gap-2'>
                          <div>
                            <span>Order: </span>
                            <span className="text-white">{formatCurrency(order?.orderPrice || 0, popupSalary?.currency || popupPayoutCurrency)}</span>
                          </div>
                          <div>
                            <span>Settle </span>
                            <span className="text-white">{formatCurrency(order?.settleAmount || 0, popupSalary?.currency || popupPayoutCurrency)}</span>
                          </div>

                        <div>
                          <span>Profit </span>
                          <span className="text-emerald-300">{formatCurrency(order?.ownerProfit || 0, popupSalary?.currency || popupPayoutCurrency)}</span>
                          {/* {order?.sourceCurrency && order?.targetCurrency && order?.sourceCurrency !== order?.targetCurrency && (
                            <>
                              <span className="mx-2 text-gray-500">|</span>
                              <span className="text-gray-400">
                                Original {order.sourceCurrency}: {Number(order?.originalOwnerProfit || 0).toFixed(2)} @ {Number(order?.fxRate || 1).toFixed(4)}
                              </span>
                            </>
                          )} */}
                        </div>
                      </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">
                        <div className='grid grid-cols-2 gap-2'>
                          <div>
                            <span>Miles </span>
                            <span className="text-white">
                              {formatDistanceWithKm(order?.driverMiles)}
                            </span>
                          </div>
                          <div>
                            <span className='capitalize'> {order?.driverRateType || ''} Rate </span>
                            <span className="text-white">
                              {Number(order?.driverAvgRate || 0) > 0 ? `${formatCurrency(order?.driverAvgRate || 0, popupSalary?.currency || popupPayoutCurrency)}/mi` : 'N/A'}
                            </span>
                          </div>
                         
                          <div>
                            <span>Driver Salary </span>
                            <span className="text-rose-300">-{formatCurrency(order?.driverDeduction || 0, popupSalary?.currency || popupPayoutCurrency)}</span> 
                      </div>
                      </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(order?.payable || 0, popupSalary?.currency || popupPayoutCurrency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Popup>

      <Popup open={expensePopupOpen} onClose={() => setExpensePopupOpen(false)} showTrigger={false} size="md:max-w-xl" space="p-6" bg="bg-black">
        <div className="text-white">
          <h3 className="text-xl font-bold">
            {editingExpenseRecord
              ? (expenseType === 'addition' ? 'Edit Extra Amount' : 'Edit Deduction')
              : (expenseType === 'addition' ? 'Add Extra Amount' : 'Add Deduction')}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {selectedOwner?.fullName || 'Owner Operator'} ({selectedOwner?.ownerOperatorId || '—'}) • {monthOptions.find((m) => m.month === popupMonth && m.year === popupYear)?.label || ''}
          </p>
          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="input-item">
              <label className="text-sm text-gray-400">Amount</label>
              <input
                className="input-sm"
                type="number"
                min="0"
                step="0.01"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="input-item">
              <label className="text-sm text-gray-400">Notes</label>
              <textarea
                className="input-sm !h-24"
                value={expenseNotes}
                onChange={(e) => setExpenseNotes(e.target.value)}
                placeholder="Reason / reference"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button
              className="btn sm bg-gray-700 text-white"
              onClick={() => {
                setExpensePopupOpen(false);
                setEditingExpenseRecord(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn sm main-btn text-black font-semibold"
              onClick={submitExpenseEntry}
              disabled={expenseSaving}
            >
              {expenseSaving ? 'Saving...' : (editingExpenseRecord ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      </Popup>

      <Popup open={paymentPopupOpen} onClose={() => setPaymentPopupOpen(false)} showTrigger={false} size="md:max-w-xl" space="p-6" bg="bg-black">
        <div className="text-white">
          <h3 className="text-xl font-bold">Mark Payslip Payment</h3>
          <p className="text-sm text-gray-400 mt-1">
            {paymentOwner?.fullName || 'Owner Operator'} ({paymentOwner?.ownerOperatorId || '—'})
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="input-item sm:col-span-2">
              <label className="text-sm text-gray-400">Select Month</label>
              <select
                className="input-sm"
                value={`${paymentYear}-${String(paymentMonth).padStart(2, '0')}`}
                onChange={(e) => onPaymentMonthChange(e.target.value)}
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="input-item">
              <label className="text-sm text-gray-400">Due Amount</label>
              <div className="input-sm flex items-center text-white">
                {(paymentLookupLoading || paymentDueLoading)
                  ? 'Loading...'
                  : formatCurrency(selectedPaymentDue, popupPayoutCurrency)}
              </div>
            </div>
            <div className="input-item">
              <label className="text-sm text-gray-400">Paid Amount</label>
              <input
                className="input-sm"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter paid amount"
                disabled={selectedPaymentDue <= 0}
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                <span>Remaining after entry: {formatCurrency(remainingAfterEntry, popupPayoutCurrency)}</span>
                <button
                  type="button"
                  className="text-main hover:underline"
                  onClick={() => setPaymentAmount(String(selectedPaymentDue.toFixed(2)))}
                  disabled={selectedPaymentDue <= 0}
                >
                  Pay Full Due
                </button>
              </div>
            </div>
            <div className="input-item sm:col-span-2">
              <label className="text-sm text-gray-400">Notes (Optional)</label>
              <input
                className="input-sm"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Payment reference / notes"
              />
            </div>
          </div>

          {!paymentLookupLoading && !paymentSalaryRecord && Number(paymentDueAmount || 0) > 0 && (
            <p className="text-xs text-yellow-300 mt-3">Salary record will be auto-generated on Save Payment.</p>
          )}
          {!paymentLookupLoading && Number(paymentSalaryRecord?.dueAmount ?? paymentDueAmount ?? 0) <= 0 && (
            <p className="text-xs text-rose-300 mt-3">No payable amount found for the selected month.</p>
          )}

          <div className="flex justify-end gap-2 mt-5">
            <button className="btn sm bg-gray-700 text-white" onClick={() => setPaymentPopupOpen(false)}>Cancel</button>
            <button
              className="btn sm main-btn text-black font-semibold"
              onClick={submitSalaryPayment}
              disabled={paymentSaving || paymentLookupLoading || paymentDueLoading}
            >
              {paymentSaving ? 'Saving...' : 'Save Payment'}
            </button>
          </div>
        </div>
      </Popup>
    </AuthLayout>
  );
}
