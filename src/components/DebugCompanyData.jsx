import React, { useContext } from 'react';
import { UserContext } from '../context/AuthProvider';

export default function DebugCompanyData() {
  const { company } = useContext(UserContext);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px', 
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Company Debug Data:</h4>
      <div style={{ marginBottom: '5px' }}>
        <strong>Name:</strong> {company?.name || 'N/A'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Email:</strong> {company?.email || 'N/A'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Primary Remittance:</strong> {company?.remittance_primary_email || 'N/A'}
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Secondary Remittance:</strong> {company?.remittance_secondary_email || 'N/A'}
      </div>
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        <strong>Full Company Object:</strong>
        <pre style={{ fontSize: '10px', marginTop: '5px', maxHeight: '100px', overflow: 'auto' }}>
          {JSON.stringify(company, null, 2)}
        </pre>
      </div>
    </div>
  );
}
