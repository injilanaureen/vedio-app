import React, { useEffect, useRef, useState } from 'react';
import api from './api';

export default function Recorder({ user }) {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoElement = videoRef.current;
        if (videoElement) videoElement.srcObject = stream;
      } catch (err) {
        alert('Camera access required: ' + err.message);
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
    if (!stream) return alert('Camera not available');
    
    chunksRef.current = [];
    setChunks([]);
    setPreviewUrl(null);
    setRecordingTime(0);
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
        setChunks([...chunksRef.current]);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    };

    mediaRecorderRef.current.start();
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
    mediaRecorderRef.current.stop();
    setRecording(false);
    setPaused(false);
  };

  const uploadVideo = async () => {
    if (chunks.length === 0 || !previewUrl) return alert('No video to upload');
    
    setUploading(true);
    try {
      // Create blob from preview URL
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      
      const form = new FormData();
      form.append('video', blob, 'recorded.webm');
      form.append('userId', user._id || user.id);

      await api.post('/vedio/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Uploaded successfully');
      setChunks([]);
      setPreviewUrl(null);
      setRecordingTime(0);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
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

  return (
    <div className="card">
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
    </div>
  );
}
