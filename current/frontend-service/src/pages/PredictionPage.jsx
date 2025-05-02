import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import api from '../services/api';

/**
 * PredictionPage: shows a single prediction result, auto-refreshing until boxes are available.
 */
const PredictionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(true);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Poll the transaction endpoint until result is available
  useEffect(() => {
    let interval;
    const fetchTx = async () => {
      try {
        const resp = await api.get(`/transactions/${id}`);
        const tx = resp.data;
        setTransaction(tx);
        setLoading(false);
        if (tx.result) {
          setPolling(false);
          clearInterval(interval);
        }
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
        setLoading(false);
        setPolling(false);
        clearInterval(interval);
      }
    };
    fetchTx();
    if (polling) {
      interval = setInterval(fetchTx, 5000);
    }
    return () => clearInterval(interval);
  }, [id, polling]);

  // Draw bounding boxes on image
  useEffect(() => {
    if (transaction?.result?.length > 0 && imgRef.current && canvasRef.current) {
      const boxes = transaction.result;
      const img = imgRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      const scaleX = img.clientWidth / img.naturalWidth;
      const scaleY = img.clientHeight / img.naturalHeight;
      boxes.forEach(([x1, y1, x2, y2]) => {
        ctx.strokeRect(
          x1 * scaleX,
          y1 * scaleY,
          (x2 - x1) * scaleX,
          (y2 - y1) * scaleY
        );
      });
    }
  }, [transaction]);

  if (loading) {
    return <div className="text-center mt-5">Loading prediction...</div>;
  }
  if (error) {
    return <div className="text-danger text-center mt-5">{error}</div>;
  }

  // Construct data URL for input image (assume JPEG)
  const dataUrl = transaction.input_image
    ? `data:image/jpeg;base64,${transaction.input_image}`
    : null;

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <BalanceCard />
          <h2 className="mt-4">Prediction #{transaction.id}</h2>
          <p>Submitted at: {new Date(transaction.timestamp).toLocaleString()}</p>
          {polling && (
            <div className="alert alert-info">Waiting for results...</div>
          )}
          {dataUrl && (
            <div className="mb-3" style={{ position: 'relative', display: 'inline-block' }}>
              <img
                ref={imgRef}
                src={dataUrl}
                alt="Input"
                className="img-fluid"
              />
              <canvas
                ref={canvasRef}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </div>
          )}
          {transaction.result && (
            <div className="mt-3">
              {transaction.result.length === 0 ? (
                <div className="alert alert-info">
                  No objects detected. Credits have been refunded.
                </div>
              ) : (
                <>
                  <h5>Detected Boxes:</h5>
                  <pre>{JSON.stringify(transaction.result, null, 2)}</pre>
                </>
              )}
            </div>
          )}
          <button
            className="btn btn-secondary mt-4"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionPage; 