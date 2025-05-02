import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import api from '../services/api';

/**
 * Dashboard page: shows balance and allows image prediction.
 */
const DashboardPage = () => {
  const navigate = useNavigate();
  const [previewSrc, setPreviewSrc] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [polling, setPolling] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewSrc(reader.result);
    reader.readAsDataURL(f);
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = previewSrc.split(',')[1];
      const response = await api.post('/predict', { image: base64 });
      const { transaction_id } = response.data;
      // Redirect to prediction result page
      navigate(`/prediction/${transaction_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Poll the transaction until YOLO results are available
  useEffect(() => {
    let interval;
    if (polling && transactionId) {
      interval = setInterval(async () => {
        try {
          const resp = await api.get('/transactions/');
          const tx = resp.data.find((t) => t.id === transactionId);
          if (tx && tx.result) {
            setBoxes(tx.result);
            setPolling(false);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [polling, transactionId]);

  // Draw bounding boxes when available
  useEffect(() => {
    if (boxes.length > 0 && imgRef.current && canvasRef.current) {
      const img = imgRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Match canvas size to image natural dimensions
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      // Clear and set draw style
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      // Scale factors based on displayed size
      const scaleX = img.clientWidth / img.naturalWidth;
      const scaleY = img.clientHeight / img.naturalHeight;
      boxes.forEach((box) => {
        const [x1, y1, x2, y2] = box;
        ctx.strokeRect(
          x1 * scaleX,
          y1 * scaleY,
          (x2 - x1) * scaleX,
          (y2 - y1) * scaleY
        );
      });
    }
  }, [boxes]);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <BalanceCard />
          <h2 className="mt-4">Image Prediction</h2>
          <div className="mb-3">
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          {previewSrc && (
            <div className="mb-3" style={{ position: 'relative', display: 'inline-block' }}>
              <img
                ref={imgRef}
                src={previewSrc}
                alt="Preview"
                className="img-fluid"
              />
              <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
          )}
          <button
            className="btn btn-primary mb-3 w-100"
            onClick={handlePredict}
            disabled={loading || !file}
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>
          {error && <div className="text-danger">{error}</div>}
          {result && (
            <div className="alert alert-info">
              {result}
            </div>
          )}
          {boxes.length > 0 && (
            <div className="mt-3">
              <h5>Detected Boxes (x1, y1, x2, y2):</h5>
              <pre>{JSON.stringify(boxes, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 