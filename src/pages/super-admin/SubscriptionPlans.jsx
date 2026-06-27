import React, { useEffect, useState } from 'react';
import Api from '../../api/Api';
import SuperAdminLayout from '../../layout/SuperAdminLayout';
import Popup from '../common/Popup';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import Nocontent from '../common/NoContent';
 

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  );
}

// Monthly base price + per-cycle discount %, with a live effective-price preview.
function PricingFields({ form, onChange, onDiscountChange, cyclePreview }) {
  const cur = form.currency || 'USD';
  return (
    <div className="mt-2 mb-1 rounded-xl border border-gray-800 bg-gray-800/30 p-4">
      <div className="grid grid-cols-2 gap-4 mb-3">
        <Field label="Monthly price">
          <input type="number" min="0" step="0.01" className="input-sm" value={form.monthlyPrice ?? 0}
            onChange={e => onChange('monthlyPrice', e.target.value)} />
        </Field>
        <Field label="Currency">
          <input className="input-sm uppercase" value={cur} onChange={e => onChange('currency', e.target.value)} maxLength={3} />
        </Field>
      </div>
      <label className="block text-sm text-gray-300 mb-2">Discount % per billing cycle</label>
      <div className="grid grid-cols-3 gap-3">
        {['monthly', 'quarterly', 'yearly'].map((c) => (
          <div key={c}>
            <div className="flex items-center gap-1">
              <input type="number" min="0" max="100" className="input-sm" value={form.discounts?.[c] ?? 0}
                onChange={e => onDiscountChange(c, e.target.value)} />
              <span className="text-gray-500 text-sm">%</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-1 capitalize">
              {c}: <span className="text-gray-200">{cur} {cyclePreview(c)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Plan limits. A plan is metered by ORDERS PER MONTH plus a total TEAM SEAT count.
// Customers, carriers and fleet are intentionally NOT capped (master data).
function LimitsFields({ form, onLimitChange }) {
  const cell = (k, label, hint) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number" min="0" className="input-sm"
        value={form?.limits?.[k] ?? ''}
        onChange={(e) => onLimitChange(k, e.target.value)}
        placeholder="0 = unlimited"
      />
      <p className="text-[11px] text-gray-500 mt-1">{hint}</p>
    </div>
  );
  return (
    <div className="mt-2 mb-1 rounded-xl border border-gray-800 bg-gray-800/30 p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <span className="text-sm font-semibold text-white">Plan limits</span>
        <span className="text-[11px] text-gray-500">0 = unlimited</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cell('maxOrders', 'Orders / month', 'Resets every month')}
        {cell('maxUsers', 'Team members', 'Total seats (not monthly)')}
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm mb-2">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="text-gray-300">{label}</span>
    </label>
  );
}

const ACCENT = '#a091ff';
const fmtNum = (n) => (Number(n) || 0).toLocaleString();
const planCycle = (p, cycle) => {
  const months = cycle === 'yearly' ? 12 : cycle === 'quarterly' ? 3 : 1;
  const base = (Number(p.monthlyPrice) || 0) * months;
  const disc = Math.min(100, Math.max(0, Number(p.discounts?.[cycle]) || 0));
  return { price: Math.round(base * (1 - disc / 100) * 100) / 100, disc };
};

// Premium catalog card: price-forward, per-cycle pricing, quiet stats.
function PlanCard({ p, onEdit, onDelete }) {
  const cur = p.currency || 'USD';
  const mods = Array.isArray(p.allowedModules) ? p.allowedModules : [];
  const orders = (p?.limits?.maxOrders ?? 0) === 0 ? '∞' : fmtNum(p.limits.maxOrders);
  const team = (p?.limits?.maxUsers ?? 0) === 0 ? '∞' : fmtNum(p.limits.maxUsers);
  const cycles = [['Mo', 'monthly'], ['Qtr', 'quarterly'], ['Yr', 'yearly']];

  return (
    <div className="group relative rounded-2xl bg-dark1 border border-white/[0.07] overflow-hidden transition-all duration-300 hover:border-[#a091ff]/45 hover:shadow-[0_18px_40px_-20px_rgba(160,145,255,0.5)]">
      {/* top accent */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}33)` }} />
      <div className="p-6">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-white font-mona font-bold text-xl tracking-tight truncate">{p.name}</h3>
            <span className="inline-block mt-1 text-[11px] font-mono text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded">{p.slug}</span>
          </div>
          <span
            className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={p.isActive
              ? { color: '#34d399', background: 'rgba(52,211,153,0.12)' }
              : { color: '#9ca3af', background: 'rgba(156,163,175,0.12)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.isActive ? '#34d399' : '#9ca3af' }} />
            {p.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* price hero */}
        <div className="mt-5 flex items-baseline gap-1.5">
          <span className="text-gray-400 text-sm font-medium">{cur}</span>
          <span className="text-white font-mona font-bold text-4xl tracking-tight">{fmtNum(p.monthlyPrice ?? 0)}</span>
          <span className="text-gray-500 text-sm">/mo</span>
        </div>

        {/* per-cycle pricing */}
        <div className="mt-3 flex gap-2">
          {cycles.map(([label, key]) => {
            const c = planCycle(p, key);
            return (
              <div key={key} className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] px-2.5 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
                <div className="text-sm font-semibold text-gray-100">{cur} {fmtNum(c.price)}</div>
                {c.disc > 0 && <div className="text-[10px] font-semibold" style={{ color: ACCENT }}>−{c.disc}%</div>}
              </div>
            );
          })}
        </div>

        {p.description && <p className="mt-4 text-gray-400 text-sm leading-relaxed line-clamp-2">{p.description}</p>}

        {/* stats */}
        <div className="mt-5 flex items-stretch rounded-xl bg-white/[0.03] border border-white/[0.06] divide-x divide-white/[0.06]">
          <div className="flex-1 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-gray-500">Orders / mo</div>
            <div className="text-lg font-mona font-bold text-white mt-0.5">{orders}</div>
          </div>
          <div className="flex-1 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-gray-500">Team seats</div>
            <div className="text-lg font-mona font-bold text-white mt-0.5">{team}</div>
          </div>
        </div>

        {/* modules */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {mods.length ? mods.map((m) => (
            <span key={m} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: ACCENT, background: `${ACCENT}14`, border: `1px solid ${ACCENT}2e` }}>
              {m === 'outsourcing' ? 'Outsourcing' : 'Trucking'}
            </span>
          )) : (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-gray-500 bg-white/[0.04] border border-white/[0.06]">No modules</span>
          )}
        </div>

        {/* actions */}
        <div className="mt-6 flex gap-2.5">
          <button
            onClick={onEdit}
            className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors"
            style={{ background: ACCENT, color: '#000' }}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-4 rounded-xl py-2.5 text-sm font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    monthlyPrice: 0,
    currency: 'USD',
    discounts: { monthly: 0, quarterly: 0, yearly: 0 },
    limits: { maxUsers: 10, maxOrders: 1000, maxCustomers: 1000, maxCarriers: 500, maxDrivers: 0, maxTrucks: 0, maxTrailers: 0, maxOwnerOperators: 0 },
    allowedModules: ['outsourcing', 'regular'],
    featuresInput: ''
  });

  const [action, setAction] = useState();

  const VALID_MODULES = ['outsourcing', 'regular'];
  const sanitizeAllowedModules = (value) => {
    if (!Array.isArray(value)) return [];
    return value
      .map((m) => String(m).toLowerCase().trim())
      .filter((m) => VALID_MODULES.includes(m));
  };

  const getErrorMessage = (e) => {
    const raw = e?.response?.data;
    if (typeof raw === 'string' && /ValidationError/i.test(raw)) {
      const m = raw.match(/ValidationError:\s*([^<\n]+)/i);
      return m ? `ValidationError: ${m[1].trim()}` : 'ValidationError';
    }
    return e?.response?.data?.message || e?.message || 'Request failed';
  };

  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await Api.get('/api/super-admin/subscription-plans');
      const data = res?.data?.data?.plans || [];
      setPlans(data);
      setAction("close")
    } catch (e) {
      setError(getErrorMessage(e) || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const onLimitChange = (key, value) => setForm(prev => ({ ...prev, limits: { ...prev.limits, [key]: value } }));
  const onDiscountChange = (cycle, value) => setForm(prev => ({ ...prev, discounts: { ...prev.discounts, [cycle]: value } }));

  // Preview the effective price for a cycle from the current form state.
  const cyclePreview = (cycle) => {
    const months = cycle === 'yearly' ? 12 : cycle === 'quarterly' ? 3 : 1;
    const base = (Number(form.monthlyPrice) || 0) * months;
    const disc = Math.min(100, Math.max(0, Number(form.discounts?.[cycle]) || 0));
    return Math.round(base * (1 - disc / 100) * 100) / 100;
  };
  
  const onModuleToggle = (module) => {
    setForm(prev => {
      const current = sanitizeAllowedModules(prev.allowedModules);
      if (current.includes(module)) {
        return { ...prev, allowedModules: current.filter(m => m !== module) };
      } else {
        return { ...prev, allowedModules: sanitizeAllowedModules([...current, module]) };
      }
    });
  };

  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      limits: { maxUsers: 10, maxOrders: 1000, maxCustomers: 1000, maxCarriers: 500, maxDrivers: 0, maxTrucks: 0, maxTrailers: 0, maxOwnerOperators: 0 },
      allowedModules: ['outsourcing', 'regular'],
      featuresInput: ''
    });
  };

  const createPlan = async (e) => {
    e && e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const allowedModules = sanitizeAllowedModules(form.allowedModules);
      if (!allowedModules.length) {
        setError('Please select at least one module');
        return;
      }
      if (!String(form.description || '').trim()) {
        setError('Description is required');
        return;
      }
      const features = form.featuresInput
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        description: String(form.description || '').trim(),
        isActive: form.isActive,
        monthlyPrice: Number(form.monthlyPrice) || 0,
        currency: (form.currency || 'USD').toUpperCase(),
        discounts: {
          monthly: Number(form.discounts?.monthly) || 0,
          quarterly: Number(form.discounts?.quarterly) || 0,
          yearly: Number(form.discounts?.yearly) || 0
        },
        limits: {
          maxUsers: Number(form?.limits?.maxUsers) || 0,
          maxOrders: Number(form?.limits?.maxOrders) || 0,
          maxCustomers: Number(form?.limits?.maxCustomers) || 0,
          maxCarriers: Number(form?.limits?.maxCarriers) || 0
        },
        features,
        allowedModules
      };

      const res = await Api.post('/api/super-admin/subscription-plans', payload);
      const created = res?.data?.data?.plan;
      if (created) {
        setAction("close")
        window.location.reload();
        setTimeout(() => {
          resetForm();
        }, 1000);
        await fetchPlans();
        toast.success('Plan created successfully');
      }
    } catch (e) {
      setError(getErrorMessage(e) || 'Failed to create plan');
    } finally {
      setSubmitting(false);
      setAction("close")
    }
  };

  const startEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      isActive: plan.isActive,
      monthlyPrice: plan.monthlyPrice ?? 0,
      currency: plan.currency || 'USD',
      discounts: {
        monthly: plan.discounts?.monthly ?? 0,
        quarterly: plan.discounts?.quarterly ?? 0,
        yearly: plan.discounts?.yearly ?? 0
      },
      limits: {
        maxUsers: plan.limits?.maxUsers ?? 10,
        maxOrders: plan.limits?.maxOrders ?? 1000,
        maxCustomers: plan.limits?.maxCustomers ?? 1000,
        maxCarriers: plan.limits?.maxCarriers ?? 500,
        maxDrivers: plan.limits?.maxDrivers ?? 0,
        maxTrucks: plan.limits?.maxTrucks ?? 0,
        maxTrailers: plan.limits?.maxTrailers ?? 0,
        maxOwnerOperators: plan.limits?.maxOwnerOperators ?? 0
      },
      allowedModules: sanitizeAllowedModules(plan.allowedModules).length ? sanitizeAllowedModules(plan.allowedModules) : ['outsourcing'],
      featuresInput: Array.isArray(plan.features) ? plan.features.join(', ') : ''
    });
  };

  const updatePlan = async (e) => {
    e && e.preventDefault();
    if (!editingPlan) return;
    
    setSubmitting(true);
    setError('');
    try {
      const allowedModules = sanitizeAllowedModules(form.allowedModules);
      if (!allowedModules.length) {
        setError('Please select at least one module');
        return;
      }
      if (!String(form.description || '').trim()) {
        setError('Description is required');
        return;
      }
      const features = form.featuresInput
        .split(',')
        .map(f => f.trim())
        .filter(Boolean);

      const payload = {
        name: form.name,
        slug: form.slug,
        description: String(form.description || '').trim(),
        isActive: form.isActive,
        monthlyPrice: Number(form.monthlyPrice) || 0,
        currency: (form.currency || 'USD').toUpperCase(),
        discounts: {
          monthly: Number(form.discounts?.monthly) || 0,
          quarterly: Number(form.discounts?.quarterly) || 0,
          yearly: Number(form.discounts?.yearly) || 0
        },
        limits: {
          maxUsers: Number(form.limits.maxUsers) || 0,
          maxOrders: Number(form.limits.maxOrders) || 0,
          maxCustomers: Number(form.limits.maxCustomers) || 0,
          maxCarriers: Number(form.limits.maxCarriers) || 0
        },
        features,
        allowedModules
      };

      console.log('Frontend: Updating plan with payload:', payload);
      console.log('Frontend: Plan ID:', editingPlan._id);
      
      const res = await Api.put(`/api/super-admin/subscription-plans/${editingPlan._id}`, payload);
      console.log('Frontend: Update response:', res.data);
      if (res.data.status) {
        setEditingPlan(null);
        resetForm();
        await fetchPlans();
        toast.success('Plan updated successfully');
      }
    } catch (e) {
      setError(getErrorMessage(e) || 'Failed to update plan');
    } finally {
      setSubmitting(false);
    }
  };

  const startDelete = (plan) => {
    setDeletingPlan(plan);
    setDeleteConfirmInput('');
  };

  const deletePlan = async () => {
    if (!deletingPlan || deleteConfirmInput !== deletingPlan.slug) {
      setError('Please type the plan slug to confirm deletion');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await Api.delete(`/api/super-admin/subscription-plans/${deletingPlan._id}`);
      setDeletingPlan(null);
      setDeleteConfirmInput('');
      await fetchPlans();
      toast.success('Plan deleted successfully');
    } catch (e) {
      const errorMsg = e?.response?.data?.message || 'Failed to delete plan';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    resetForm();
    setError('');
  };

  const cancelDelete = () => {
    setDeletingPlan(null);
    setDeleteConfirmInput('');
    setError('');
  };

   

  return (
    <SuperAdminLayout>
      <div className="">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl text-white font-mona font-bold mb-1">Pricing Plans</h2>
            <p className="text-sm text-gray-400">{plans.length} plan{plans.length === 1 ? '' : 's'} · tenant admins choose one from their billing page</p>
          </div>
          <div className="flex gap-2">
            <Popup action={action} btntext='New Plan' btnclasses={'btn'} bg={'bg-gray-900'} >
                <div className="bg-gray-900 w-full  p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white text-xl md:text-2xl font-semibold">Create New Plan</h3>
                  </div>
                  <form onSubmit={createPlan}>
                    <div className="">
                      <Field label="Name">
                        <input className="input-sm mb-3" value={form.name} onChange={e => onChange('name', e.target.value)} required />
                      </Field>
                      {/* <Field label="Slug (optional)">
                        <input className="input-sm" value={form.slug} onChange={e => onChange('slug', e.target.value)} placeholder="auto-generated from name" />
                        </Field> */}
                      <Field label="Description">
                        <input className="input-sm" value={form.description} onChange={e => onChange('description', e.target.value)} required />
                      </Field>
                    </div>
                    <PricingFields form={form} onChange={onChange} onDiscountChange={onDiscountChange} cyclePreview={cyclePreview} />
                    <LimitsFields form={form} onLimitChange={onLimitChange} />

                    <div className="mt-4">
                      <label className="block text-sm text-gray-300 mb-2">Included Modules</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={form.allowedModules?.includes('outsourcing')} 
                            onChange={() => onModuleToggle('outsourcing')}
                          />
                          Outsourcing (Carriers)
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={form.allowedModules?.includes('regular')} 
                            onChange={() => onModuleToggle('regular')}
                          />
                          Regular (Trucking)
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
                      <button type="submit" disabled={submitting} className="btn">
                        {submitting ? 'Creating…' : 'Create Plan'}
                      </button>
                    </div>
                  </form>
                </div>
            </Popup>

            <button
              className="btn bg-gray-700 text-white"
              onClick={fetchPlans}
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <Loading/>
        ) : plans.length === 0 ? (
          <Nocontent />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {plans.map((p) => (
              <PlanCard key={p._id || p.slug} p={p} onEdit={() => startEdit(p)} onDelete={() => startDelete(p)} />
            ))}
          </div>
        )}

        {editingPlan && (
          <Popup open={!!editingPlan} onClose={cancelEdit} showTrigger={false} bg={'bg-gray-900'} size={'md:max-w-2xl'}>
            <div className="rounded-lg p-6 w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-xl font-semibold">Edit Plan: {editingPlan.name}</h3>
              </div>
              {error && (<div className="mb-4 text-red-400 text-sm">{error}</div>)}
              <form onSubmit={updatePlan}>
                <div className="space-y-4">
                  <Field label="Name">
                    <input className="input-sm" value={form.name} onChange={e => onChange('name', e.target.value)} required />
                  </Field>
                  <Field label="Slug">
                    <input className="input-sm" value={form.slug} onChange={e => onChange('slug', e.target.value)} required />
                    <p className="text-xs text-gray-400 mt-1">Changing slug may affect URLs and integrations</p>
                  </Field>
                  <Field label="Description">
                    <textarea className="input-sm" value={form.description} onChange={e => onChange('description', e.target.value)} rows={3} required />
                  </Field>
                  <PricingFields form={form} onChange={onChange} onDiscountChange={onDiscountChange} cyclePreview={cyclePreview} />
                  <LimitsFields form={form} onLimitChange={onLimitChange} />
                  <Field label="Features (comma-separated)">
                    <input className="input-sm" value={form.featuresInput} onChange={e => onChange('featuresInput', e.target.value)} placeholder="analytics, priority-support, custom-reports" />
                  </Field>
                  <div className="mt-4">
                    <label className="block text-sm text-gray-300 mb-2">Included Modules</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={form.allowedModules?.includes('outsourcing')} 
                          onChange={() => onModuleToggle('outsourcing')}
                        />
                        Outsourcing (Carriers)
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={form.allowedModules?.includes('regular')} 
                          onChange={() => onModuleToggle('regular')}
                        />
                        Regular (Trucking)
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Toggle label="Active" checked={form.isActive} onChange={(checked) => onChange('isActive', checked)} />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                  <button type="button" onClick={cancelEdit} className="px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn">{submitting ? 'Updating…' : 'Update Plan'}</button>
                </div>
              </form>
            </div>
          </Popup>
        )}

        {deletingPlan && (
          <Popup open={!!deletingPlan} onClose={cancelDelete} showTrigger={false} bg={'bg-gray-900'} size={'md:max-w-md'}>
            <div className="rounded-lg p-6 w-full">
              <div className="mb-4">
                <h3 className="text-white text-xl font-semibold mb-2">Delete Plan</h3>
                <p className="text-gray-300 mb-2">Are you sure you want to delete <strong className="text-white">{deletingPlan.name}</strong>?</p>
                <p className="text-red-400 text-sm mb-4">This action cannot be undone.</p>
                <Field label={`Type "${deletingPlan.slug}" to confirm:`}>
                  <input className="input-sm" value={deleteConfirmInput} onChange={e => setDeleteConfirmInput(e.target.value)} placeholder={deletingPlan.slug} />
                </Field>
                {error && (<div className="mt-2 text-red-400 text-sm">{error}</div>)}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={cancelDelete} className="px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
                <button onClick={deletePlan} disabled={submitting || deleteConfirmInput !== deletingPlan.slug} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Deleting…' : 'Delete Plan'}</button>
              </div>
            </div>
          </Popup>
        )}
         
      </div>
    </SuperAdminLayout>
  );
}
