import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const { user } = useAuth();

  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
    'Entertainment', 'Healthcare', 'Education', 'Travel', 'Other'
  ];

  const incomeCategories = [
    'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAll({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await transactionAPI.create(formData);
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions(); // Refresh the list
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error adding transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionAPI.delete(id);
        fetchTransactions(); // Refresh the list
        alert('Transaction deleted successfully!');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>➕ Add Transaction</h1>
        <p>Record your income and expenses</p>
      </div>

      <div className="form-row">
        {/* Add Transaction Form */}
        <div className="card">
          <h2>New Transaction</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Transaction Type</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount ({user?.currency})</label>
                <input
                  type="number"
                  name="amount"
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                {formData.type === 'expense' ? 'Category' : 'Income Source'}
              </label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select {formData.type === 'expense' ? 'category' : 'source'}</option>
                {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                name="description"
                className="form-input"
                placeholder="Add a description..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Add Transaction
            </button>
          </form>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <h2>Recent Transactions</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-muted text-center">No transactions yet</p>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>
                        <span style={{ 
                          color: transaction.type === 'income' ? '#27ae60' : '#e74c3c',
                          fontWeight: 'bold'
                        }}>
                          {transaction.type}
                        </span>
                      </td>
                      <td>{transaction.category}</td>
                      <td style={{ 
                        color: transaction.type === 'income' ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                      }}>
                        {user?.currency}{transaction.amount}
                      </td>
                      <td>
                        <button 
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                          onClick={() => handleDelete(transaction._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;