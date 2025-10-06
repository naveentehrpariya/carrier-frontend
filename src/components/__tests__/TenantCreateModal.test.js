import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TenantCreateModal from '../TenantCreateModal';

// Mock the API module
jest.mock('../../api/Api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const Api = require('../../api/Api');

describe('TenantCreateModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock API response for existing tenants
    Api.get.mockResolvedValue({
      data: {
        status: true,
        data: [
          { name: 'Existing Company', subdomain: 'existing-company' },
        ],
      },
    });
  });

  const renderModal = (isOpen = true) => {
    return render(
      <TenantCreateModal
        isOpen={isOpen}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );
  };

  it('renders modal when open', async () => {
    renderModal();
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tenant')).toBeInTheDocument();
    });
  });

  it('does not render modal when closed', () => {
    renderModal(false);
    
    expect(screen.queryByText('Create New Tenant')).not.toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderModal();
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tenant')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create tenant/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Company name is required')).toBeInTheDocument();
      expect(screen.getByText('Admin name is required')).toBeInTheDocument();
      expect(screen.getByText('Admin email is required')).toBeInTheDocument();
    });
  });

  it('auto-generates subdomain from company name', async () => {
    const user = userEvent.setup();
    renderModal();
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tenant')).toBeInTheDocument();
    });

    const companyNameInput = screen.getByPlaceholderText('ACME Transport Inc');
    await user.type(companyNameInput, 'Test Company LLC');

    const subdomainInput = screen.getByPlaceholderText('acme-transport');
    expect(subdomainInput.value).toBe('test-company-llc');
  });

  it('validates duplicate company names', async () => {
    const user = userEvent.setup();
    renderModal();
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tenant')).toBeInTheDocument();
    });

    // Fill in a company name that already exists
    const companyNameInput = screen.getByPlaceholderText('ACME Transport Inc');
    await user.type(companyNameInput, 'Existing Company');

    const submitButton = screen.getByRole('button', { name: /create tenant/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Company name already exists')).toBeInTheDocument();
    });
  });

  it('validates subdomain format', async () => {
    const user = userEvent.setup();
    renderModal();
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tenant')).toBeInTheDocument();
    });

    const subdomainInput = screen.getByPlaceholderText('acme-transport');
    await user.clear(subdomainInput);
    await user.type(subdomainInput, 'Invalid Subdomain!');

    const submitButton = screen.getByRole('button', { name: /create tenant/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Subdomain can only contain lowercase letters, numbers, and hyphens')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    renderModal();
    
    // Mock successful API response
    Api.post.mockResolvedValue({
      data: {
        status: true,
        data: {
          id: '123',
          name: 'Test Company',
          subdomain: 'test-company',
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Create New Tenant')).toBeInTheDocument();
    });

    // Fill in all required fields
    await user.type(screen.getByPlaceholderText('ACME Transport Inc'), 'Test Company');
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test Admin');
    await user.type(screen.getByPlaceholderText('admin@acmetransport.com'), 'admin@testcompany.com');
    await user.type(screen.getByPlaceholderText('MC123456'), 'MC789012');
    await user.type(screen.getByPlaceholderText('DOT789012'), 'DOT345678');

    const submitButton = screen.getByRole('button', { name: /create tenant/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(Api.post).toHaveBeenCalledWith('/api/super-admin/tenants', expect.objectContaining({
        name: 'Test Company',
        subdomain: 'test-company',
        adminName: 'Test Admin',
        adminEmail: 'admin@testcompany.com',
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles API errors', async () => {
    const user = userEvent.setup();
    renderModal();
    
    // Mock API error
    Api.post.mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'Tenant already exists' },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Create New Tenant')).toBeInTheDocument();
    });

    // Fill in required fields
    await user.type(screen.getByPlaceholderText('ACME Transport Inc'), 'Test Company');
    await user.type(screen.getByPlaceholderText('John Doe'), 'Test Admin');
    await user.type(screen.getByPlaceholderText('admin@acmetransport.com'), 'admin@testcompany.com');
    await user.type(screen.getByPlaceholderText('MC123456'), 'MC789012');
    await user.type(screen.getByPlaceholderText('DOT789012'), 'DOT345678');

    const submitButton = screen.getByRole('button', { name: /create tenant/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(Api.post).toHaveBeenCalled();
      // Should not call success handlers on error
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('closes modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderModal();
    
    await waitFor(() => {
      expect(screen.getByText('Create New Tenant')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});