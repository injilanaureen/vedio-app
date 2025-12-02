import React, { useEffect, useState } from 'react';
import api, { getBackendBaseUrl } from './utils/api';
import showAlert from './utils/alert';

export default function AdminDashboard({ user ,setUser}) {
  const [videos, setVideos] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [playerSrc, setPlayerSrc] = useState(null);
  const [composeEmailTo, setComposeEmailTo] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'emails'

  const fetchVideos = async () => {
    try {
      const res = await api.get('/admin/videos');
      setVideos(res.data);
    } catch (err) {
      showAlert.error('Failed to fetch videos', 'Error');
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const res = await api.get('/admin/email-logs');
      setEmailLogs(res.data);
    } catch (err) {
      showAlert.error('Failed to fetch email logs', 'Error');
    }
  };

  useEffect(() => { 
    fetchVideos(); 
    fetchEmailLogs();
  }, []);

  const openPlayer = (filePath) => {
    // Normalize path: replace backslashes with forward slashes for URLs
    const normalizedPath = filePath.replace(/\\/g, '/');
    const backendUrl = getBackendBaseUrl();
    setPlayerSrc(`${backendUrl}/${normalizedPath}`);
  };

  const openEmailComposer = (email) => {
    setComposeEmailTo(email);
    setSubject('');
    setMessage('');
  };

  const sendEmail = async () => {
    if (!composeEmailTo || !message) return showAlert.warning('Please enter a message', 'Message Required');
    try {
      await api.post('/admin/send-email', { 
        email: composeEmailTo, 
        subject, 
        message,
        adminId: user._id 
      });
      showAlert.success('Email sent successfully!', 'Success');
      setComposeEmailTo(null);
      fetchEmailLogs(); // Refresh email logs
    } catch (err) {
      showAlert.error('Failed to send email: ' + (err.response?.data?.error || err.message), 'Email Error');
      fetchEmailLogs(); // Refresh logs even on error to show failed status
    }
  };
const  handleLogout = () => {
  setUser(null);
  showAlert.success('Logged out successfully!', 'Success');
}
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Admin Dashboard</h2>
          <p>Signed in as: {user.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 16px' }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('videos')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'videos' ? '#4caf50' : 'transparent',
            color: activeTab === 'videos' ? 'white' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === 'videos' ? '2px solid #4caf50' : 'none',
            marginBottom: '-2px'
          }}
        >
          Videos ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: activeTab === 'emails' ? '#4caf50' : 'transparent',
            color: activeTab === 'emails' ? 'white' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === 'emails' ? '2px solid #4caf50' : 'none',
            marginBottom: '-2px'
          }}
        >
          Email Logs ({emailLogs.length})
        </button>
      </div>

      {/* Videos Table */}
      {activeTab === 'videos' && (
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
      )}

      {/* Email Logs Table */}
      {activeTab === 'emails' && (
        <table className="simple-table">
          <thead>
            <tr>
              <th>To</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Sent By</th>
              <th>Sent At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {emailLogs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  No emails sent yet
                </td>
              </tr>
            ) : (
              emailLogs.map(email => (
                <tr key={email._id}>
                  <td>{email.to}</td>
                  <td>{email.subject || '(No subject)'}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.message}
                  </td>
                  <td>{email.sent_by?.email || 'Unknown'}</td>
                  <td>{new Date(email.sent_at).toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: email.status === 'sent' ? '#4caf50' : '#f44336',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {email.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                    </span>
                    {email.error && (
                      <div style={{ fontSize: '10px', color: '#f44336', marginTop: '4px' }}>
                        {email.error.substring(0, 50)}...
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

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
