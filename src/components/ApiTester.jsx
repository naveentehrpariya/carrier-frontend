import React, { useState } from 'react';
import Api from '../api/Api';
import { toast } from 'react-hot-toast';

export default function ApiTester() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testEndpoint = async (endpoint, key) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      console.log(`🧪 Testing ${endpoint}...`);
      const response = await Api.get(endpoint);
      console.log(`📊 ${endpoint} response:`, response.data);
      
      setResults(prev => ({ 
        ...prev, 
        [key]: {
          success: true,
          data: response.data,
          status: response.status
        }
      }));
      
      toast.success(`${endpoint} - Success`);
    } catch (error) {
      console.error(`❌ ${endpoint} error:`, error);
      setResults(prev => ({ 
        ...prev, 
        [key]: {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        }
      }));
      toast.error(`${endpoint} - Error: ${error.response?.status || error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const endpoints = [
    { url: '/api/super-admin/overview', key: 'overview', label: 'Overview' },
    { url: '/api/super-admin/tenants', key: 'tenants', label: 'Tenants (no params)' },
    { url: '/api/super-admin/tenants?limit=10', key: 'tenants_limit', label: 'Tenants (limit=10)' },
    { url: '/api/super-admin/tenants?page=1&limit=10', key: 'tenants_page', label: 'Tenants (paginated)' },
    { url: '/api/super-admin/analytics?period=30d', key: 'analytics', label: 'Analytics' }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Super Admin API Tester</h2>
      
      <div className="grid grid-cols-1 gap-4 mb-6">
        {endpoints.map(({ url, key, label }) => (
          <div key={key} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">{label}</div>
              <div className="text-sm text-gray-500">{url}</div>
            </div>
            <button
              onClick={() => testEndpoint(url, key)}
              disabled={loading[key]}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading[key] ? 'Testing...' : 'Test'}
            </button>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => endpoints.forEach(({ url, key }) => testEndpoint(url, key))}
        className="w-full mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Test All Endpoints
      </button>

      <div className="space-y-4">
        {Object.entries(results).map(([key, result]) => (
          <div key={key} className="border rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{endpoints.find(e => e.key === key)?.label}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {result.success ? `Success (${result.status})` : `Error (${result.status})`}
              </span>
            </div>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(result.success ? result.data : result.error, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}