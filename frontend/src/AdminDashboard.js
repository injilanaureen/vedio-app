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
  const [activeTab, setActiveTab] = useState('videos');
  const [searchQuery, setSearchQuery] = useState('');
  const [emailSearchQuery, setEmailSearchQuery] = useState('');
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

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
    setSendingEmail(true);
    try {
      await api.post('/admin/send-email', { 
        email: composeEmailTo, 
        subject, 
        message,
        adminId: user._id 
      });
      showAlert.success('Email sent successfully!', 'Success');
      setComposeEmailTo(null);
      setSubject('');
      setMessage('');
      fetchEmailLogs();
    } catch (err) {
      showAlert.error('Failed to send email: ' + (err.response?.data?.error || err.message), 'Email Error');
      fetchEmailLogs();
    } finally {
      setSendingEmail(false);
    }
  };

  const deleteVideo = async (videoId) => {
    const result = await showAlert.confirm(
      'Are you sure you want to delete this video? This action cannot be undone.',
      'Delete Video'
    );
    
    if (!result.isConfirmed) return;

    setDeletingVideo(videoId);
    try {
      await api.delete(`/admin/delete-video/${videoId}`);
      showAlert.success('Video deleted successfully!', 'Deleted');
      fetchVideos();
    } catch (err) {
      showAlert.error('Failed to delete video: ' + (err.response?.data?.error || err.message), 'Delete Error');
    } finally {
      setDeletingVideo(null);
    }
  };

  const downloadVideo = (filePath) => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const backendUrl = getBackendBaseUrl();
    const videoUrl = `${backendUrl}/${normalizedPath}`;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `video-${Date.now()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    setUser(null);
    showAlert.success('Logged out successfully!', 'Success');
  };

  // Filter videos
  const filteredVideos = videos.filter(v => {
    const email = (v.user_id?.email || '').toLowerCase();
    const date = new Date(v.created_at).toLocaleString().toLowerCase();
    return email.includes(searchQuery.toLowerCase()) || date.includes(searchQuery.toLowerCase());
  });

  // Filter emails
  const filteredEmails = emailLogs.filter(e => {
    const to = e.to.toLowerCase();
    const subject = (e.subject || '').toLowerCase();
    const message = e.message.toLowerCase();
    const query = emailSearchQuery.toLowerCase();
    return to.includes(query) || subject.includes(query) || message.includes(query);
  });
  return (
    <div className="card">
      <div className="header">
        <div className="header-info">
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Signed in as: {user.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-danger btn-sm">
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('videos')}
          className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
        >
          📹 Videos ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={`tab ${activeTab === 'emails' ? 'active' : ''}`}
        >
          📧 Email Logs ({emailLogs.length})
        </button>
      </div>

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <>
          {videos.length > 0 && (
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search by email or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          )}
          
          {filteredVideos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📹</div>
              <div className="empty-state-text">
                {searchQuery ? 'No videos found' : 'No videos uploaded yet'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Client Email</th>
                    <th>Uploaded At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map(v => (
                    <tr key={v._id}>
                      <td>{v.user_id?.email || 'Unknown'}</td>
                      <td>{new Date(v.created_at).toLocaleString()}</td>
                      <td>
                        <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                          <button onClick={() => openPlayer(v.file_path)} className="btn-sm">
                            ▶ Play
                          </button>
                          <button onClick={() => downloadVideo(v.file_path)} className="btn-sm btn-outline">
                            ⬇ Download
                          </button>
                          <button onClick={() => openEmailComposer(v.user_id?.email)} className="btn-sm btn-success">
                            📧 Email
                          </button>
                          <button 
                            onClick={() => deleteVideo(v._id)} 
                            className="btn-sm btn-danger"
                            disabled={deletingVideo === v._id}
                          >
                            {deletingVideo === v._id ? (
                              <>
                                <span className="loading-spinner"></span>
                                Deleting...
                              </>
                            ) : (
                              '🗑 Delete'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Email Logs Tab */}
      {activeTab === 'emails' && (
        <>
          {emailLogs.length > 0 && (
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search emails..."
                value={emailSearchQuery}
                onChange={(e) => setEmailSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          )}

          {filteredEmails.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📧</div>
              <div className="empty-state-text">
                {emailSearchQuery ? 'No emails found' : 'No emails sent yet'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
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
                  {filteredEmails.map(email => (
                    <tr key={email._id}>
                      <td>{email.to}</td>
                      <td>{email.subject || '(No subject)'}</td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {email.message}
                      </td>
                      <td>{email.sent_by?.email || 'Unknown'}</td>
                      <td>{new Date(email.sent_at).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${email.status === 'sent' ? 'status-success' : 'status-failed'}`}>
                          {email.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                        </span>
                        {email.error && (
                          <div className="text-muted" style={{ fontSize: '10px', marginTop: '4px' }}>
                            {email.error.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Video Player Modal */}
      {playerSrc && (
        <div style={{ marginTop: '24px', padding: '24px', background: 'var(--light)', borderRadius: '12px' }}>
          <div className="flex-between mb-2">
            <h4>Video Player</h4>
            <button onClick={() => setPlayerSrc(null)} className="btn-sm btn-secondary">
              ✕ Close
            </button>
          </div>
          <video src={playerSrc} controls style={{ width: '100%', maxWidth: 800, borderRadius: '12px' }} />
        </div>
      )}

      {/* Email Composer Modal */}
      {composeEmailTo && (
        <div style={{ marginTop: '24px', padding: '24px', background: 'var(--light)', borderRadius: '12px' }}>
          <div className="flex-between mb-2">
            <h4>📧 Send Email to {composeEmailTo}</h4>
            <button onClick={() => { setComposeEmailTo(null); setSubject(''); setMessage(''); }} className="btn-sm btn-secondary">
              ✕ Cancel
            </button>
          </div>
          <input 
            placeholder="Subject (optional)" 
            value={subject} 
            onChange={e => setSubject(e.target.value)}
            style={{ marginTop: '12px' }}
          />
          <textarea 
            placeholder="Enter your message..." 
            value={message} 
            onChange={e => setMessage(e.target.value)}
            style={{ marginTop: '12px' }}
          />
          <div className="flex gap-2" style={{ marginTop: '16px' }}>
            <button onClick={sendEmail} disabled={sendingEmail || !message} className="btn-success">
              {sendingEmail ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending...
                </>
              ) : (
                '📤 Send Email'
              )}
            </button>
            <button 
              onClick={() => { setComposeEmailTo(null); setSubject(''); setMessage(''); }} 
              className="btn-secondary"
              disabled={sendingEmail}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
