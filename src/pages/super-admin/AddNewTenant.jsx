import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import SuperAdminLayout from '../../layout/SuperAdminLayout';
import Api from '../../api/Api';

const ACCENT = '#a091ff';

export default function AddNewTenant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companySlug: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Credentials returned after a successful create — shown once for handoff.
  const [created, setCreated] = useState(null);

  const baseDomain = useMemo(() => {
    try {
      return process.env.REACT_APP_TENANT_DOMAIN || window.location.hostname.replace(/^www\./, '');
    } catch {
      return 'app';
    }
  }, []);

  // Auto-generate slug from company name
  useEffect(() => {
    if (formData.companyName) {
      const slug = formData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData((prev) => ({ ...prev, companySlug: slug }));
    } else {
      setFormData((prev) => ({ ...prev, companySlug: '' }));
    }
  }, [formData.companyName]);

  // Check slug availability (debounced)
  useEffect(() => {
    if (!formData.companySlug || formData.companySlug.length <= 2) {
      setSlugAvailable(null);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setCheckingSlug(true);
      try {
        const response = await Api.get(`/api/super-admin/check-slug?slug=${formData.companySlug}`);
        if (active) setSlugAvailable(response.data.available);
      } catch (error) {
        if (active) setSlugAvailable(null);
      } finally {
        if (active) setCheckingSlug(false);
      }
    }, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [formData.companySlug]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.companyName.trim()) e.companyName = 'Company name is required';
    if (!formData.companySlug.trim()) e.companySlug = 'A URL slug is required';
    if (slugAvailable === false) e.companySlug = 'This slug is already taken';
    if (!formData.adminName.trim()) e.adminName = 'Admin name is required';
    if (!formData.adminEmail.trim()) e.adminEmail = 'Admin email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) e.adminEmail = 'Enter a valid email address';
    if (formData.adminPassword) {
      if (formData.adminPassword.length < 6) e.adminPassword = 'Use at least 6 characters';
      if (formData.confirmPassword !== formData.adminPassword)
        e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) {
      toast.error('Fix the highlighted fields to continue');
      return;
    }

    setLoading(true);
    try {
      // Backend contract (superAdminTenantController.createTenant):
      // { name, subdomain, contactInfo:{adminName,adminEmail,phone,address}, subscriptionPlanId, adminPassword }
      const payload = {
        name: formData.companyName.trim(),
        subdomain: formData.companySlug.trim(),
        contactInfo: {
          adminName: formData.adminName.trim(),
          adminEmail: formData.adminEmail.trim().toLowerCase(),
          phone: formData.adminPhone.trim(),
          address: '',
        },
      };
      if (formData.adminPassword) payload.adminPassword = formData.adminPassword;

      const response = await Api.post('/api/super-admin/tenants', payload);
      const data = response.data?.data || {};

      if (response.data?.status) {
        toast.success('Tenant provisioned');
        setCreated({
          name: formData.companyName.trim(),
          email: data.credentials?.email || formData.adminEmail.trim(),
          password: data.credentials?.password || data.tempPassword || '',
          url: data.credentials?.url || data.tenant?.url || '',
        });
      } else {
        toast.error(response.data?.message || 'Failed to create tenant');
      }
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data || {};
      const apiMessage = data.message;

      if (status === 409) {
        const msg = apiMessage || 'A tenant or admin email already exists';
        toast.error(msg);
        if (/email/i.test(msg)) setErrors((p) => ({ ...p, adminEmail: msg }));
        else setErrors((p) => ({ ...p, companySlug: 'This slug is already taken' }));
      } else if (Array.isArray(data.errors) && data.errors.length) {
        data.errors.slice(0, 3).forEach((err) => {
          const msg = typeof err === 'string' ? err : err?.message || err?.msg || apiMessage;
          if (msg) toast.error(String(msg));
        });
      } else {
        toast.error(apiMessage || error.message || 'Failed to create tenant');
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, label) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  };

  // ---- Success handoff screen ----
  if (created) {
    return (
      <SuperAdminLayout heading="Tenant Created">
        <div className="max-w-xl mx-auto">
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${ACCENT}1a`, border: `1px solid ${ACCENT}55` }}
            >
              <CheckCircleIcon className="h-8 w-8" style={{ color: ACCENT }} />
            </div>
            <h1 className="text-2xl font-bold text-white">{created.name} is live</h1>
            <p className="text-gray-400 mt-1 text-sm">
              These credentials are shown once. Copy and share them with the tenant admin now.
            </p>
          </div>

          <div className="bg-dark1 border border-gray-800 rounded-2xl divide-y divide-gray-800">
            <CredRow label="Workspace URL" value={created.url} onCopy={() => copy(created.url, 'URL')} link />
            <CredRow label="Admin email" value={created.email} onCopy={() => copy(created.email, 'Email')} />
            <CredRow label="Password" value={created.password} onCopy={() => copy(created.password, 'Password')} secret />
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              onClick={() => {
                setCreated(null);
                setFormData({
                  companyName: '', companySlug: '', adminName: '', adminEmail: '',
                  adminPhone: '', adminPassword: '', confirmPassword: '',
                });
                setSlugAvailable(null);
              }}
              className="flex-1 px-5 py-3 border border-gray-700 text-gray-200 rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Create another
            </button>
            <button
              onClick={() => navigate('/super-admin/tenants')}
              className="flex-1 btn rounded-xl !py-3"
            >
              Go to tenants
            </button>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  // ---- Provisioning form ----
  return (
    <SuperAdminLayout heading="Add New Tenant">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/super-admin')}
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Form column */}
          <form onSubmit={handleSubmit} className="space-y-6 order-2 lg:order-1">
            <Section icon={BuildingOfficeIcon} title="Company" step="1">
              <Field label="Company name" required error={errors.companyName} full>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={inputCls(errors.companyName)}
                  placeholder="Acme Logistics Inc."
                  autoFocus
                />
              </Field>

              <Field
                label="Workspace URL"
                required
                error={errors.companySlug}
                full
                hint="Auto-generated from the company name. Used as the tenant subdomain."
              >
                <div className="flex items-stretch">
                  <input
                    type="text"
                    name="companySlug"
                    value={formData.companySlug}
                    onChange={handleInputChange}
                    className={`${inputCls(errors.companySlug)} rounded-r-none flex-1 min-w-0`}
                    placeholder="acme-logistics"
                  />
                  <span className="inline-flex items-center px-3 bg-dark border border-l-0 border-gray-700 rounded-r-xl text-gray-500 text-sm whitespace-nowrap">
                    .{baseDomain}
                  </span>
                  <span className="inline-flex items-center w-9 justify-center">
                    {checkingSlug && (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: ACCENT }} />
                    )}
                    {!checkingSlug && slugAvailable === true && (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                    )}
                    {!checkingSlug && slugAvailable === false && (
                      <span className="h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">✕</span>
                    )}
                  </span>
                </div>
              </Field>
            </Section>

            <Section icon={UserIcon} title="Admin user" step="2">
              <Field label="Full name" required error={errors.adminName}>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  className={inputCls(errors.adminName)}
                  placeholder="Jane Doe"
                />
              </Field>
              <Field label="Email" required error={errors.adminEmail}>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  className={inputCls(errors.adminEmail)}
                  placeholder="jane@acme.com"
                />
              </Field>
              <Field label="Phone" hint="Optional">
                <input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleInputChange}
                  className={inputCls()}
                  placeholder="+1 (555) 123-4567"
                />
              </Field>
              <Field
                label="Password"
                error={errors.adminPassword}
                hint="Leave blank to auto-generate"
              >
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="adminPassword"
                    value={formData.adminPassword}
                    onChange={handleInputChange}
                    className={inputCls(errors.adminPassword)}
                    placeholder="Auto-generated"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </Field>
              {formData.adminPassword && (
                <Field label="Confirm password" error={errors.confirmPassword} full>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={inputCls(errors.confirmPassword)}
                    placeholder="Re-enter password"
                  />
                </Field>
              )}
            </Section>

            <div
              className="rounded-2xl p-4 text-sm flex items-start gap-3"
              style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}33` }}
            >
              <span className="mt-0.5" style={{ color: ACCENT }}>ⓘ</span>
              <p className="text-gray-300">
                No plan is assigned at creation. The tenant admin chooses and buys a subscription
                after logging in. Order creation stays locked until a plan is active.
              </p>
            </div>
          </form>

          {/* Live manifest — the signature element. Sticky summary that becomes the handoff. */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-[140px]">
            <div className="bg-dark1 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Provisioning manifest</span>
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: ACCENT }} />
              </div>
              <div className="p-5 space-y-4">
                <ManifestRow label="Tenant">
                  <span className="text-white font-semibold">
                    {formData.companyName || <span className="text-gray-600">—</span>}
                  </span>
                </ManifestRow>
                <ManifestRow label="Workspace">
                  {formData.companySlug ? (
                    <span className="text-gray-200 break-all">
                      {formData.companySlug}
                      <span className="text-gray-500">.{baseDomain}</span>
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </ManifestRow>
                <div className="flex items-center gap-2 text-gray-400 text-sm py-1">
                  <span className="truncate">{formData.adminName || 'Admin'}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 shrink-0" style={{ color: ACCENT }} />
                  <span className="truncate text-gray-500">{formData.adminEmail || 'email'}</span>
                </div>
                <ManifestRow label="Subscription">
                  <span className="text-gray-400">Buys after login</span>
                </ManifestRow>
                <ManifestRow label="Password">
                  <span className="text-gray-400">
                    {formData.adminPassword ? 'Set manually' : 'Auto-generated'}
                  </span>
                </ManifestRow>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || slugAvailable === false}
                  className="w-full btn rounded-xl !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Provisioning…' : 'Create tenant'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/super-admin')}
                  className="w-full mt-2 px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

// ---- presentational helpers ----

const inputCls = (error) =>
  `w-full text-white bg-dark1 border rounded-xl px-4 py-3 focus:outline-0 focus:shadow-0 transition-colors ${
    error ? 'border-red-500/70 focus:border-red-500' : 'border-gray-700 focus:border-[#a091ff]'
  }`;

function Section({ icon: Icon, title, step, children }) {
  return (
    <section className="bg-dark border border-gray-800 rounded-2xl p-6 sm:p-7">
      <div className="flex items-center mb-5">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center mr-3"
          style={{ background: `${ACCENT}1a` }}
        >
          <Icon className="h-5 w-5" style={{ color: ACCENT }} />
        </div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <span className="ml-auto text-[11px] text-gray-600 tracking-widest">STEP {step}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, error, hint, full, children }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span style={{ color: ACCENT }}>*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

function ManifestRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-right min-w-0">{children}</span>
    </div>
  );
}

function CredRow({ label, value, onCopy, secret, link }) {
  const [show, setShow] = useState(!secret);
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">{label}</p>
        <p className="text-white text-sm font-mono truncate">
          {secret && !show ? '•'.repeat(Math.max(8, String(value).length)) : value || '—'}
        </p>
      </div>
      {secret && (
        <button onClick={() => setShow((s) => !s)} className="text-gray-500 hover:text-gray-300" title="Reveal">
          {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      )}
      {link && value && (
        <a href={value} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-300" title="Open">
          <ArrowTopRightOnSquareIcon className="h-5 w-5" />
        </a>
      )}
      <button onClick={onCopy} className="text-gray-500 hover:text-gray-300" title="Copy">
        <ClipboardDocumentIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
