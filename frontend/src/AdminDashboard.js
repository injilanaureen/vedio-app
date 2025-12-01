import React, { useEffect, useState } from 'react';
import api from './api';

export default function AdminDashboard({ user }) {
  const [videos, setVideos] = useState([]);
  const [playerSrc, setPlayerSrc] = useState(null);
  const [composeEmailTo, setComposeEmailTo] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const fetchVideos = async () => {
    try {
      const res = await api.get('/admin/videos');
      setVideos(res.data);
    } catch (err) {
      alert('Failed to fetch videos');
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const openPlayer = (filePath) => {
    // Normalize path: replace backslashes with forward slashes for URLs
    const normalizedPath = filePath.replace(/\\/g, '/');
    setPlayerSrc(`http://localhost:5000/${normalizedPath}`);
  };

  const openEmailComposer = (email) => {
    setComposeEmailTo(email);
    setSubject('');
    setMessage('');
  };

  const sendEmail = async () => {
    if (!composeEmailTo || !message) return alert('Enter message');
    try {
      await api.post('/admin/send-email', { email: composeEmailTo, subject, message });
      alert('Email sent');
      setComposeEmailTo(null);
    } catch (err) {
      alert('Email failed');
    }
  };

  return (
    <div className="card">
      <h2>Admin Dashboard</h2>
      <p>Signed in as: {user.email}</p>

      <table className="simple-table">
        <thead>
          <tr><th>Client Email</th><th>Uploaded At</th><th>Play</th><th>Send Email</th></tr>
        </thead>
        <tbody>
          {videos.map(v => (
            <tr key={v._id}>
              <td>{v.user_id?.email || 'Unknown'}</td>
              <td>{new Date(v.created_at).toLocaleString()}</td>
              <td>
                <button onClick={() => openPlayer(v.file_path)}>Play</button>
              </td>
              <td>
                <button onClick={() => openEmailComposer(v.user_id?.email)}>Email</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {playerSrc && (
        <div style={{ marginTop: 12 }}>
          <h4>Video Player</h4>
          <video src={playerSrc} controls style={{ width: '100%', maxWidth: 700 }} />
          <br />
          <button onClick={() => setPlayerSrc(null)}>Close</button>
        </div>
      )}

      {composeEmailTo && (
        <div style={{ marginTop: 12 }}>
          <h4>Send Email to {composeEmailTo}</h4>
          <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
          <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button onClick={sendEmail}>Send</button>
            <button onClick={() => setComposeEmailTo(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
