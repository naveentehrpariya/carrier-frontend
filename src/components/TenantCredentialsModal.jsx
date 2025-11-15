import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { 
  XMarkIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function TenantCredentialsModal({ isOpen, onClose, credentials, companyName }) {
  const [showPassword, setShowPassword] = useState(false);

  // Build the complete share message
  const shareMessage = [
    `🎉 Your Carrier TMS account is ready!`,
    ``,
    `🔗 Login URL: ${credentials?.url || ''}`,
    `📧 Email: ${credentials?.email || ''}`,
    `🔐 Password: ${credentials?.password || ''}`,
    ``,
    `⚠️ IMPORTANT: Please log in and change your password immediately for security.`,
    ``,
    `Need help? Contact support.`
  ].filter(Boolean).join('\n');

  // Generate share links
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const emailLink = `mailto:?subject=${encodeURIComponent(`Your ${companyName || 'Carrier TMS'} Account is Ready`)}&body=${encodeURIComponent(shareMessage)}`;
  const smsLink = `sms:?body=${encodeURIComponent(shareMessage)}`;

  // Copy to clipboard with fallback
  const copyToClipboard = async (text, label = 'Text') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  if (!isOpen || !credentials) {
    return null;
  }

  // Check if password is missing (robustness)
  const hasPassword = credentials.password && credentials.password.length > 0;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
              Tenant Created Successfully
            </DialogTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Success Message */}
            <div className="text-center">
              <p className="text-gray-600">
                {companyName ? `${companyName} has been created successfully!` : 'New tenant has been created successfully!'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Share these credentials with the tenant admin
              </p>
            </div>

            {/* Login URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Login URL
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                  <a 
                    href={credentials.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {credentials.url}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.url, 'URL')}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Copy URL"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Admin Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                  {credentials.email}
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.email, 'Email')}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Copy Email"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Admin Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              {hasPassword ? (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono">
                    {showPassword ? credentials.password : '••••••••••••'}
                  </div>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(credentials.password, 'Password')}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    title="Copy Password"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-yellow-700">
                      Password was not returned by the server. Please set a password manually or re-invite tenant admin.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {hasPassword && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => copyToClipboard(shareMessage, 'Complete credentials')}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center justify-center"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    Copy All Information
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors flex items-center justify-center"
                  >
                    <ShareIcon className="h-4 w-4 mr-1" />
                    WhatsApp
                  </a>
                  
                  <a
                    href={emailLink}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors flex items-center justify-center"
                  >
                    <ShareIcon className="h-4 w-4 mr-1" />
                    Email
                  </a>
                  
                  <a
                    href={smsLink}
                    className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-md transition-colors flex items-center justify-center"
                  >
                    <ShareIcon className="h-4 w-4 mr-1" />
                    SMS
                  </a>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-700">
                  <strong>Security Notice:</strong> Store these credentials securely now. 
                  The password won't be shown again and should be changed immediately after first login.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}