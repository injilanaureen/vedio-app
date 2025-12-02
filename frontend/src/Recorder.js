import React, { useEffect, useRef, useState } from 'react';
import api, { getBackendBaseUrl } from './utils/api';
import showAlert from './utils/alert';

export default function Recorder({ user ,setUser}) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [myVideos, setMyVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingVideo, setDeletingVideo] = useState(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let stream = null;
    async function setup() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoElement = videoRef.current;
        if (videoElement) videoElement.srcObject = stream;
      } catch (err) {
        showAlert.error('Camera access required: ' + err.message, 'Camera Error');
      }
    }
    setup();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Cleanup preview URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Fetch user's videos
  const fetchMyVideos = async () => {
    if (!user?._id && !user?.id) return;
    setLoadingVideos(true);
    try {
      const userId = user._id || user.id;
      const url = `/vedio/my-videos/${userId}`;
      console.log('Fetching videos from:', url);
      const res = await api.get(url);
      console.log('Fetched videos:', res.data);
      setMyVideos(res.data || []);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      console.error('Error response:', err.response);
      if (err.response?.status === 404) {
        showAlert.error('Route not found. Please redeploy backend.', 'Error');
      } else {
        showAlert.error('Failed to load your videos: ' + (err.response?.data?.error || err.message), 'Error');
      }
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchMyVideos();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer effect
  useEffect(() => {
    if (recording && !paused) {
      startTimeRef.current = Date.now() - recordingTime * 1000;
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [recording, paused, recordingTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const start = () => {
    const stream = videoRef.current.srcObject;
    if (!stream) return showAlert.warning('Camera not available', 'Camera Error');
    
    chunksRef.current = [];
    setPreviewUrl(null);
    setRecordingTime(0);
    
    // Create MediaRecorder with options
    const options = { mimeType: 'video/webm;codecs=vp8,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }
    mediaRecorderRef.current = new MediaRecorder(stream, options);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
        console.log('Chunk received:', e.data.size, 'bytes. Total chunks:', chunksRef.current.length);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      // Wait a bit to ensure all chunks are collected
      setTimeout(() => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          console.log('Preview blob created:', blob.size, 'bytes from', chunksRef.current.length, 'chunks');
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
        } else {
          console.error('No chunks available for preview');
        }
      }, 100);
    };

    // Start recording with timeslice to get chunks more frequently
    mediaRecorderRef.current.start(1000); // Get chunks every 1 second
    setRecording(true);
    setPaused(false);
  };

  const pause = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setPaused(true);
    }
  };

  const resume = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setPaused(false);
    }
  };

  const stop = () => {
    if (!mediaRecorderRef.current) return;
    
    // Request final data before stopping
    if (mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.requestData();
    }
    
    mediaRecorderRef.current.stop();
    setRecording(false);
    setPaused(false);
  };

  const uploadVideo = async () => {
    if (chunksRef.current.length === 0) {
      return showAlert.warning('No video to upload', 'Upload Error');
    }
    
    setUploading(true);
    try {
      // Create blob directly from chunks (more reliable than fetching from previewUrl)
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      
      console.log('Uploading video:', {
        blobSize: blob.size,
        chunksCount: chunksRef.current.length,
        blobType: blob.type
      });
      
      const form = new FormData();
      form.append('video', blob, 'recorded.webm');
      form.append('userId', user._id || user.id);

      const response = await api.post('/vedio/upload', form, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted + '%');
        }
      });
      
      console.log('Upload response:', response.data);
      showAlert.success('Video uploaded successfully!', 'Upload Complete');
      chunksRef.current = [];
      setPreviewUrl(null);
      setRecordingTime(0);
      fetchMyVideos(); // Refresh video list
    } catch (err) {
      console.error('Upload error details:', err);
      showAlert.error('Upload failed: ' + (err.response?.data?.error || err.message), 'Upload Error');
    } finally {
      setUploading(false);
    }
  };

  const discardVideo = () => {
    chunksRef.current = [];
    setPreviewUrl(null);
    setRecordingTime(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setPaused(false);
  };

  const deleteVideo = async (videoId) => {
    const result = await showAlert.confirm(
      'Are you sure you want to delete this video? This action cannot be undone.',
      'Delete Video'
    );
    
    if (!result.isConfirmed) return;

    setDeletingVideo(videoId);
    try {
      await api.delete(`/vedio/delete/${videoId}`, {
        data: { userId: user._id || user.id }
      });
      showAlert.success('Video deleted successfully!', 'Deleted');
      fetchMyVideos();
    } catch (err) {
      showAlert.error('Failed to delete video: ' + (err.response?.data?.error || err.message), 'Delete Error');
    } finally {
      setDeletingVideo(null);
    }
  };

  const downloadVideo = (videoUrl, videoId) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `video-${videoId}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    setUser(null);
    showAlert.success('Logged out successfully!', 'Logout');
  };

  // Filter videos based on search query
  const filteredVideos = myVideos.filter(video => {
    const dateStr = new Date(video.created_at).toLocaleString().toLowerCase();
    return dateStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="card">
      <div className="header">
        <div className="header-info">
          <h2>Welcome, {user.email}</h2>
          <p className="text-muted">Record and manage your videos</p>
        </div>
        <button onClick={handleLogout} className="btn-danger btn-sm">
          Logout
        </button>
      </div>

      {/* Camera Preview */}
      <div style={{ marginBottom: '24px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', maxWidth: 600, borderRadius: '12px', margin: '0 auto', display: 'block' }}
        />
      </div>

      {/* Recording Timer */}
      {recording && (
        <div className="recording-timer">
          <span className="recording-dot"></span>
          Recording: {formatTime(recordingTime)}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2" style={{ justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
        {!recording ? (
          <button onClick={start} className="btn-success btn-lg">
            ▶ Start Recording
          </button>
        ) : (
          <>
            {!paused ? (
              <button onClick={pause} className="btn-warning">
                ⏸ Pause
              </button>
            ) : (
              <button onClick={resume} className="btn-success">
                ▶ Resume
              </button>
            )}
            <button onClick={stop} className="btn-danger">
              ⏹ Stop
            </button>
          </>
        )}
      </div>

      {/* Preview Section */}
      {previewUrl && (
        <div style={{ marginTop: '32px', padding: '24px', background: 'var(--light)', borderRadius: '12px' }}>
          <h4>Preview Video ({formatTime(recordingTime)})</h4>
          <p className="text-muted">Review your video before uploading</p>
          <video src={previewUrl} controls style={{ width: '100%', maxWidth: 800, marginTop: '16px', borderRadius: '12px' }} />
          <div className="flex gap-2" style={{ justifyContent: 'center', marginTop: '16px' }}>
            <button onClick={uploadVideo} disabled={uploading} className="btn-success">
              {uploading ? (
                <>
                  <span className="loading-spinner"></span>
                  Uploading...
                </>
              ) : (
                '📤 Upload Video'
              )}
            </button>
            <button onClick={discardVideo} disabled={uploading} className="btn-danger">
              🗑 Discard & Record Again
            </button>
          </div>
        </div>
      )}

      {/* Video History Section */}
      <div style={{ marginTop: '48px', borderTop: '2px solid var(--border)', paddingTop: '32px' }}>
        <div className="flex-between mb-3">
          <h3>My Uploaded Videos ({filteredVideos.length})</h3>
          {myVideos.length > 0 && (
            <div className="search-container" style={{ maxWidth: '300px', width: '100%' }}>
              <input
                type="text"
                className="search-input"
                placeholder="Search by date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
          )}
        </div>

        {loadingVideos ? (
          <div className="loading-container">
            <span className="loading-spinner"></span>
            <span className="loading-text">Loading videos...</span>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📹</div>
            <div className="empty-state-text">
              {searchQuery ? 'No videos found matching your search' : 'No videos uploaded yet'}
            </div>
            <div className="empty-state-subtext">
              {!searchQuery && 'Record and upload your first video!'}
            </div>
          </div>
        ) : (
          <div className="video-grid">
            {filteredVideos.map((video) => {
              let normalizedPath = video.file_path.replace(/\\/g, '/');
              if (!normalizedPath.startsWith('uploads/')) {
                normalizedPath = `uploads/${normalizedPath.split('/').pop()}`;
              }
              
              const backendUrl = getBackendBaseUrl();
              const videoUrl = `${backendUrl}/${normalizedPath}`;
              
              return (
                <div key={video._id} className="video-card">
                  <video 
                    src={videoUrl} 
                    controls 
                    preload="none"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Video playback error:', {
                        url: videoUrl,
                        path: normalizedPath,
                        videoId: video._id,
                        error: e.target.error
                      });
                    }}
                  />
                  <div className="video-card-info">
                    📅 {new Date(video.created_at).toLocaleString()}
                  </div>
                  <div className="video-card-actions">
                    <button 
                      onClick={() => downloadVideo(videoUrl, video._id)} 
                      className="btn-sm btn-outline"
                      style={{ flex: 1 }}
                    >
                      ⬇ Download
                    </button>
                    <button 
                      onClick={() => deleteVideo(video._id)} 
                      className="btn-sm btn-danger"
                      disabled={deletingVideo === video._id}
                      style={{ flex: 1 }}
                    >
                      {deletingVideo === video._id ? (
                        <>
                          <span className="loading-spinner"></span>
                          Deleting...
                        </>
                      ) : (
                        '🗑 Delete'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
