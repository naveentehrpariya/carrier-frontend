import React, { useState, useEffect } from 'react';

export default function DynamicCarrierEmailInput({ initialEmails = [], onChange, existingCarrier = null }) {
  const [emails, setEmails] = useState([{ email: '', is_primary: true, created_at: new Date() }]);
  const [showAdditional, setShowAdditional] = useState(false);

  useEffect(() => {
    let initialEmailsArray = [];
    
    // Initialize emails array
    if (existingCarrier && existingCarrier.emails && Array.isArray(existingCarrier.emails) && existingCarrier.emails.length > 0) {
      // If carrier has new emails array format
      initialEmailsArray = [...existingCarrier.emails];
    } else if (existingCarrier) {
      // Fallback to legacy format for backward compatibility
      if (existingCarrier.email) {
        initialEmailsArray.push({
          email: existingCarrier.email,
          is_primary: true,
          created_at: new Date()
        });
      }
      if (existingCarrier.secondary_email && 
          existingCarrier.secondary_email !== existingCarrier.email) {
        initialEmailsArray.push({
          email: existingCarrier.secondary_email,
          is_primary: false,
          created_at: new Date()
        });
      }
    } else if (initialEmails.length > 0) {
      initialEmailsArray = [...initialEmails];
    }
    if (initialEmailsArray.length > 0) {
      const cleaned = initialEmailsArray
        .map((e) => ({
          email: (e?.email || '').trim(),
          is_primary: !!e?.is_primary,
          created_at: e?.created_at || new Date()
        }))
        .filter((e) => !!e.email);
      if (cleaned.length > 0) {
        const primary = cleaned.find((e) => e.is_primary) || cleaned[0];
        const additional = cleaned
          .filter((e) => e.email !== primary.email)
          .map((e) => ({ ...e, is_primary: false }));
        const normalized = [{ ...primary, is_primary: true }, ...additional];
        setEmails(normalized);
        setShowAdditional(normalized.length > 1);
      }
    }
  }, [existingCarrier]);

  useEffect(() => {
    if (onChange) {
      onChange(emails);
    }
  }, [emails]);

  const setPrimaryEmail = (value) => {
    const updated = [...emails];
    if (!updated[0]) updated[0] = { email: '', is_primary: true, created_at: new Date() };
    updated[0] = { ...updated[0], email: value, is_primary: true };
    setEmails(updated);
  };

  const addAdditionalEmail = () => {
    setShowAdditional(true);
    setEmails((prev) => [...(prev?.length ? prev : [{ email: '', is_primary: true, created_at: new Date() }]), { email: '', is_primary: false, created_at: new Date() }]);
  };

  const setAdditionalEmail = (additionalIndex, value) => {
    const idx = additionalIndex + 1;
    const updated = [...emails];
    if (!updated[idx]) updated[idx] = { email: '', is_primary: false, created_at: new Date() };
    updated[idx] = { ...updated[idx], email: value, is_primary: false };
    setEmails(updated);
  };

  const removeAdditionalEmail = (additionalIndex) => {
    const idx = additionalIndex + 1;
    const updated = emails.filter((_, i) => i !== idx);
    const normalized = updated.length ? [{ ...updated[0], is_primary: true }, ...updated.slice(1).map((e) => ({ ...e, is_primary: false }))] : [{ email: '', is_primary: true, created_at: new Date() }];
    setEmails(normalized);
    if (normalized.length <= 1) setShowAdditional(false);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const primaryEmail = emails?.[0]?.email || '';
  const additionalEmails = (emails || []).slice(1);

  return (
    <div className="dynamic-email-input">
      <label className="mt-4 mb-2 block text-sm pt-3 text-gray-400">Primary Email</label>
      <div className="mb-3">
        <input
          type="email"
          value={primaryEmail}
          onChange={(e) => setPrimaryEmail(e.target.value)}
          placeholder="Primary email"
          className={`input-sm w-full ${primaryEmail && !validateEmail(primaryEmail) ? 'border-red-500' : ''}`}
        />
        {primaryEmail && !validateEmail(primaryEmail) && (
          <p className="text-red-400 text-xs mt-1">Invalid email format</p>
        )}
      </div>

      {showAdditional && (
        <>
          <label className="mt-4 mb-2 block text-sm text-gray-400">Additional Emails</label>
          {additionalEmails.map((emailObj, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <input
                    type="email"
                    value={emailObj.email || ''}
                    onChange={(e) => setAdditionalEmail(idx, e.target.value)}
                    placeholder="Additional email"
                    className={`input-sm w-full ${emailObj.email && !validateEmail(emailObj.email) ? 'border-red-500' : ''}`}
                  />
                  {emailObj.email && !validateEmail(emailObj.email) && (
                    <p className="text-red-400 text-xs mt-1">Invalid email format</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAdditionalEmail(idx)}
                  className="text-red-400 hover:text-red-300 text-normal p-1"
                  title="Remove email"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addAdditionalEmail();
            }}
            className="mt-2 text-blue-400 hover:text-blue-300 text-normal flex items-center cursor-pointer"
          >
            <span className="mr-1">+</span> Add Another Email
          </button>
        </>
      )}

      {!showAdditional && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addAdditionalEmail();
          }}
          className="mt-2 text-blue-400 hover:text-blue-300 text-normal flex items-center cursor-pointer"
        >
          <span className="mr-1">+</span> Add Another Email
        </button>
      )}

      <p className="text-normal text-gray-500 mt-2">
        The primary email will be used for dispatch notifications and rate confirmations. 
        You can add multiple emails for this carrier.
      </p>
    </div>
  );
}
