import React from 'react';

export default function SignupSuccess() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  const mock = params.get('mock');

  return (
    <div className="container" style={{ maxWidth: 720, margin: '40px auto', textAlign: 'center' }}>
      <h2>Thank you! Payment received.</h2>
      <p>Your signup request has been recorded. Our admin team will review your details, approve the request, and email credentials to get you started.</p>
      {sessionId && <p>Stripe session: <code>{sessionId}</code></p>}
      {mock && <p>(Development mode: Stripe not configured)</p>}
      <p>We’ll be in touch soon.</p>
    </div>
  );
}