import React, { useState, useEffect } from 'react';

export default function DynamicCarrierEmailInput({ initialEmails = [], onChange, existingCarrier = null }) {
  const [emails, setEmails] = useState([{ email: '', is_primary: true, created_at: new Date() }]);

  useEffect(() => {
    console.log('DynamicCarrierEmailInput mounted/updated with:', { existingCarrier, initialEmails });
    
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
      setEmails(initialEmailsArray);
    }
  }, [existingCarrier]);

  useEffect(() => {
    if (onChange) {
      onChange(emails);
    }
  }, [emails]);

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index].email = value;
    setEmails(updatedEmails);
  };

  const handlePrimaryChange = (index) => {
    const updatedEmails = emails.map((email, i) => ({
      ...email,
      is_primary: i === index
    }));
    setEmails(updatedEmails);
  };

  const addEmailField = () => {
    console.log('Adding email field, current emails:', emails);
    const newEmails = [
      ...emails,
      { email: '', is_primary: false, created_at: new Date() }
    ];
    setEmails(newEmails);
  };

  const removeEmailField = (index) => {
    console.log('Removing email field:', index);
    if (emails.length > 1) {
      const updatedEmails = emails.filter((_, i) => i !== index);
      if (emails[index].is_primary && updatedEmails.length > 0) {
        updatedEmails[0].is_primary = true;
      }
      setEmails(updatedEmails);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="dynamic-email-input">
      <label className="mt-4 mb-2 block text-sm pt-3 text-gray-400">Email Addresses</label>
      {emails.map((emailObj, index) => (
        <div key={index} className="mb-3">
            <div className="flex items-center gap-2 items-center">
              <div className="flex-1">
                <input
                  type="email"
                  value={emailObj.email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder={`Email ${index + 1}`}
                  className={`input-sm w-full ${
                    emailObj.email && !validateEmail(emailObj.email) 
                      ? 'border-red-500' 
                      : ''
                  }`}
                />
                {emailObj.email && !validateEmail(emailObj.email) && (
                  <p className="text-red-400 text-xs mt-1">Invalid email format</p>
                )}
              </div>

              <div className="ps-3 min-w-[120px] flex items-center">
                <input
                  type="radio"
                  name="primary_email"
                  checked={emailObj.is_primary}
                  onChange={() => handlePrimaryChange(index)}
                  className="mr-2"
                  disabled={emails.length === 1}
                />
                <label className=" text-normal text-gray-400">
                  {emailObj.is_primary ? 'Primary' : 'Secondary'}
                </label>
              </div>

              <div className=" flex justify-end me-2">
                {emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmailField(index)}
                    className="text-red-400 hover:text-red-300 text-normal p-1"
                    title="Remove email"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
        </div>
      ))}

      {/* Add new email button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Add email button clicked');
          addEmailField();
        }}
        className="mt-2 text-blue-400 hover:text-blue-300 text-normal flex items-center cursor-pointer"
      >
        <span className="mr-1">+</span> Add Another Email
      </button>

      <p className="text-normal text-gray-500 mt-2">
        The primary email will be used for dispatch notifications and rate confirmations. 
        You can add multiple emails for this carrier.
      </p>
    </div>
  );
}
