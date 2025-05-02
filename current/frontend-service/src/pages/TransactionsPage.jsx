import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import BalanceCard from '../components/BalanceCard';
import AuthContext from '../contexts/AuthContext';

/**
 * Transactions page: displays user's transaction history.
 */
const TransactionsPage = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/transactions/');
        setTransactions(response.data);
      } catch (err) {
        const detail = err.response?.data?.detail;
        if (err.response?.status === 401) {
          // Unauthorized: clear token and redirect to login
          logout();
          navigate('/login', { replace: true, state: { from: location } });
          return;
        }
        setError(detail || err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchTransactions();
    }
  }, [token, logout, navigate, location]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <BalanceCard />
          <h2 className="mt-4">Transaction History</h2>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{tx.type}</td>
                    <td>{tx.amount}</td>
                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage; 