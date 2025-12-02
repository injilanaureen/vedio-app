import React, { useState } from 'react';
import api from './utils/api';
import showAlert from './utils/alert';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return showAlert.warning('Please enter your email address', 'Email Required');
    try {
      setLoading(true);
      const res = await api.post('/auth', { email });
      setUser(res.data.user);
      showAlert.success('Login successful!', 'Welcome');
    } catch (err) {
      showAlert.error('Error: ' + (err.response?.data?.error || err.message), 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="text-center mb-3">
        <h2>Welcome Back</h2>
        <p className="text-muted">Sign in to continue</p>
      </div>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        onKeyPress={(e) => e.key === 'Enter' && submit()}
      />
      <button onClick={submit} disabled={!email || loading} className="btn-lg" style={{ width: '100%', marginTop: '16px' }}>
        {loading ? (
          <>
            <span className="loading-spinner"></span>
            Please wait...
          </>
        ) : (
          'Continue'
        )}
      </button>

      <p className="text-muted text-center mt-2" style={{ fontSize: '14px' }}>
        To test admin view: in MongoDB change this user's <code>role</code> to <code>admin</code>.
      </p>
    </div>
  );
}
