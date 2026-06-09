import React from 'react';

/**
 * ModalKit — shared building blocks for the "Add / Edit entity" modals.
 *
 * Goal: one cohesive, user-friendly shell across Employee, Customer, Carrier,
 * Owner Operator, Truck, Trailer and Driver forms. Every modal keeps its own
 * form logic; these components only own the presentation (header band, grouped
 * sections, consistent fields and a sticky footer).
 *
 * Accent colours are passed as a hex string and applied via inline styles +
 * a `--accent` CSS variable, so they survive Tailwind's class purging and let
 * each entity carry its own identity while staying on-brand.
 */

const hexA = (hex, a) => {
  const h = String(hex).replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// Per-entity accent palette. Light enough that black button text stays readable.
export const ACCENTS = {
  employee: '#a091ff', // violet (brand)
  customer: '#34d399', // emerald
  carrier: '#fbbf24',  // amber
  owner: '#38bdf8',    // sky
  truck: '#22d3ee',    // cyan
  trailer: '#e879f9',  // fuchsia
  driver: '#fb7185',   // rose
};

/** Outer wrapper — sets the accent variable used by header, footer and focus rings. */
export function ModalShell({ accent = ACCENTS.employee, children }) {
  return (
    <div className="modal-kit text-white" style={{ '--accent': accent }}>
      {children}
    </div>
  );
}

/** Header band: accent-tinted gradient, icon chip, title + subtitle. */
export function ModalHeader({ icon: Icon, title, subtitle, accent = ACCENTS.employee }) {
  return (
    <div
      className="modal-kit-head px-7 pt-7 pb-6 border-b border-white/10"
      style={{ background: `linear-gradient(135deg, ${hexA(accent, 0.16)} 0%, rgba(255,255,255,0) 62%)` }}
    >
      <div className="flex items-center gap-3.5">
        {Icon ? (
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{ background: hexA(accent, 0.14), color: accent, borderColor: hexA(accent, 0.3) }}
          >
            <Icon size={22} />
          </div>
        ) : null}
        <div className="min-w-0 pr-8">
          <h2 className="text-white text-xl font-bold font-mona leading-tight truncate">{title}</h2>
          {subtitle ? <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
}

/** A labelled group of fields laid out on a 1- or 2-column grid. */
export function FormSection({ title, children, cols = 2, divider = false, className = '' }) {
  return (
    <div className={`modal-kit-section px-7 py-5 ${divider ? 'border-t border-white/[0.06]' : ''} ${className}`}>
      {title ? (
        <div className="flex items-center gap-2 mb-4">
          <span className="h-3.5 w-1 rounded-full" style={{ background: 'var(--accent)' }} />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">{title}</h3>
        </div>
      ) : null}
      <div className={`grid grid-cols-1 ${cols === 2 ? 'sm:grid-cols-2' : ''} gap-x-4 gap-y-4`}>
        {children}
      </div>
    </div>
  );
}

/** Label + control wrapper with consistent spacing, optional hint / required mark. */
export function Field({ label, required, hint, full, className = '', children }) {
  return (
    <div className={`${full ? 'sm:col-span-2' : ''} ${className}`}>
      {label ? (
        <label className="mb-1.5 block text-[13px] font-medium text-gray-300">
          {label}
          {required ? <span className="text-rose-400 ml-0.5">*</span> : null}
        </label>
      ) : null}
      {children}
      {hint ? <p className="text-[11px] text-gray-500 mt-1.5">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ className = '', ...props }) {
  return <input {...props} className={`input-sm !mt-0 w-full ${className}`} />;
}

export function TextArea({ className = '', ...props }) {
  return <textarea {...props} className={`input-sm !mt-0 w-full py-3 ${className}`} />;
}

/** Native select restyled with a custom chevron (native arrow is hidden globally). */
export function SelectInput({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={`input-sm !mt-0 w-full pr-10 ${className}`}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
      >
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

/** Sticky footer with a secondary Cancel and an accent primary action. */
export function ModalFooter({
  onCancel,
  onSubmit,
  loading,
  disabled,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loadingLabel = 'Saving…',
}) {
  return (
    <div className="sticky bottom-0 z-10 flex justify-end items-center gap-3 px-7 py-4 border-t border-white/10 bg-black/85 backdrop-blur-md">
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-300 bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
        >
          {cancelLabel}
        </button>
      ) : null}
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || disabled}
        className="px-8 py-2.5 rounded-full text-sm font-bold text-black transition-all active:scale-[0.97] disabled:opacity-60 disabled:active:scale-100 hover:brightness-105"
        style={{ background: 'var(--accent)', boxShadow: '0 6px 20px -8px var(--accent)' }}
      >
        {loading ? loadingLabel : submitLabel}
      </button>
    </div>
  );
}
