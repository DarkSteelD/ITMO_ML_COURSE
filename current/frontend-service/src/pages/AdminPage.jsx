import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../contexts/AuthContext';

/**
 * AdminPanel page: allows admins to run a test question, view all transactions,
 * and top up all user balances.
 */
const AdminPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState(null);

  // Top-up-all state
  const [topupAmt, setTopupAmt] = useState('');
  const [topupResult, setTopupResult] = useState(null);
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupError, setTopupError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch all transactions
    const fetchAllTx = async () => {
      setTxLoading(true);
      try {
        const resp = await api.get('/transactions/all');
        setTransactions(resp.data);
      } catch (err) {
        setTxError(err.response?.data?.detail || err.message);
      } finally {
        setTxLoading(false);
      }
    };
    fetchAllTx();
  }, [token, navigate]);

  const handleTopupAll = async (e) => {
    e.preventDefault();
    const amt = parseFloat(topupAmt);
    if (isNaN(amt) || amt <= 0) {
      setTopupError('Enter a valid positive amount');
      return;
    }
    setTopupLoading(true);
    try {
      const resp = await api.post('/balance/topup_all', { amount: amt });
      setTopupResult(resp.data);
    } catch (err) {
      setTopupError(err.response?.data?.detail || err.message);
    } finally {
      setTopupLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <h2>Admin Panel</h2>

      <section className="mb-5">
        <h4>All Transactions</h4>
        {txLoading ? (
          <div>Loading transactions...</div>
        ) : txError ? (
          <div className="text-danger">{txError}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.user_id}</td>
                    <td>{tx.type}</td>
                    <td>{tx.amount}</td>
                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-5">
        <h4>Top Up All Balances</h4>
        <form onSubmit={handleTopupAll} className="mb-3">
          <div className="input-group">
            <input
              type="number"
              step="0.01"
              className="form-control"
              placeholder="Amount"
              value={topupAmt}
              onChange={(e) => setTopupAmt(e.target.value)}
              required
            />
            <button
              className="btn btn-success"
              type="submit"
              disabled={topupLoading}
            >
              {topupLoading ? 'Processing...' : 'Top Up All'}
            </button>
          </div>
        </form>
        {topupError && <div className="text-danger">{topupError}</div>}
        {topupResult && (
          <div className="alert alert-info">
            {topupResult.message}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminPage; 