import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';
import Api from '../api/Api';
import Loading from '../pages/common/Loading';

const CustomerAccessControl = ({ children, customerId }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated || !user) {
        navigate('/login');
        return;
      }

      // Admin (role 3) has access to all customers
      if (user.role === 3 && user.is_admin === 1) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // For non-admin users, check if customer is assigned to them
      try {
        const response = await Api.get(`/customer/detail/${customerId}`);
        if (response.data.status === true) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Access check failed:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      checkAccess();
    }
  }, [customerId, user, isAuthenticated, navigate]);

  if (loading) {
    return <Loading />;
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 text-lg mb-2">
            You don't have permission to view this customer's details.
          </p>
          <p className="text-normal text-gray-500 mb-8">
            This customer is not assigned to you. Please contact your administrator if you need access.
          </p>
          <button
            onClick={() => navigate('/customers')}
            className="btn"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default CustomerAccessControl;