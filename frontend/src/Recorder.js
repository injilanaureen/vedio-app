import React, { useEffect, useRef, useState } from 'react';
import api, { getBackendBaseUrl } from './utils/api';
import showAlert from './utils/alert';

export default function Recorder({ user ,setUser}) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [myVideos, setMyVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoElement = videoRef.current;
        if (videoElement) videoElement.srcObject = stream;
      } catch (err) {
        showAlert.error('Camera access required: ' + err.message, 'Camera Error');
      }
    }
    setup();

    return () => {
      const videoElement = videoRef.current;
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject;
        stream.getTracks().forEach(t => t.stop());
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

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
  }, [user]);

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
    setChunks([]);
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
        setChunks([...chunksRef.current]);
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
      setChunks([]);
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
    setChunks([]);
    setPreviewUrl(null);
    setRecordingTime(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setPaused(false);
  };
  const handleLogout = () => {
    setUser(null);
    showAlert.success('Logged out successfully!', 'Logout');
  };

  return (
    <div className="card">
        <button 
          onClick={handleLogout}
          style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 16px' }}
        >
          Logout
        </button>
      <h2>Welcome, {user.email}</h2>
    
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', maxWidth: 600, background: '#000' }}
      />

      {recording && (
        <div style={{ marginTop: 12, fontSize: '18px', fontWeight: 'bold', color: '#d32f2f' }}>
          Recording: {formatTime(recordingTime)}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {!recording ? (
          <button onClick={start}>Start Recording</button>
        ) : (
          <>
            {!paused ? (
              <button onClick={pause}>Pause</button>
            ) : (
              <button onClick={resume}>Resume</button>
            )}
            <button onClick={stop}>Stop</button>
          </>
        )}
      </div>

      {previewUrl && (
        <div style={{ marginTop: 12 }}>
          <h4>Preview Video ({formatTime(recordingTime)})</h4>
          <p style={{ color: '#666', fontSize: '14px' }}>Review your video before uploading</p>
          <video src={previewUrl} controls style={{ width: '100%', maxWidth: 600 }} />
          <div style={{ marginTop: 12, display: 'flex', gap: '8px' }}>
            <button onClick={uploadVideo} disabled={uploading} style={{ backgroundColor: '#4caf50', color: 'white' }}>
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <button onClick={discardVideo} disabled={uploading} style={{ backgroundColor: '#f44336', color: 'white' }}>
              Discard & Record Again
            </button>
          </div>
        </div>
      )}

      {/* Video History Section */}
      <div style={{ marginTop: 24, borderTop: '2px solid #e0e0e0', paddingTop: 20 }}>
        <h3>My Uploaded Videos</h3>
        {loadingVideos ? (
          <p>Loading videos...</p>
        ) : myVideos.length === 0 ? (
          <p style={{ color: '#666' }}>No videos uploaded yet. Record and upload your first video!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginTop: 16 }}>
            {myVideos.map((video) => {
              // Ensure path is normalized and starts with uploads/
              let normalizedPath = video.file_path.replace(/\\/g, '/');
              if (!normalizedPath.startsWith('uploads/')) {
                normalizedPath = `uploads/${normalizedPath.split('/').pop()}`;
              }
              
              // Use backend URL from environment variable
              const backendUrl = getBackendBaseUrl();
              const videoUrl = `${backendUrl}/${normalizedPath}`;
              
              return (
                <div key={video._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', background: '#f9f9f9' }}>
                  <video 
                    src={videoUrl} 
                    controls 
                    preload="none"
                    crossOrigin="anonymous"
                    style={{ width: '100%', borderRadius: '4px', marginBottom: '8px', maxHeight: '200px' }}
                    onError={(e) => {
                      console.error('Video playback error:', {
                        url: videoUrl,
                        path: normalizedPath,
                        videoId: video._id,
                        error: e.target.error
                      });
                      // Don't show alert for every error, just log
                    }}
                    onLoadStart={() => console.log('Loading video:', videoUrl)}
                  />
                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                    Uploaded: {new Date(video.created_at).toLocaleString()}
                  </p>
                
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#667eea', textDecoration: 'none', display: 'block', marginTop: '4px' }}
                  >
                    Open in new tab
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
