import React, { useState } from 'react';
import api from './api';

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return alert('Enter email');
    try {
      setLoading(true);
      const res = await api.post('/auth', { email });
      setUser(res.data.user);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Enter your email</h2>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="email@example.com"
      />
      <button onClick={submit} disabled={!email || loading}>
        {loading ? 'Please wait...' : 'Continue'}
      </button>

      <p style={{ marginTop: 12, color: '#666' }}>
        To test admin view: in MongoDB change this user's `role` to <code>admin</code>.
      </p>
    </div>
  );
}
