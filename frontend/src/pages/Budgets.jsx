import React, { useState, useEffect } from 'react';
import { budgetAPI, transactionAPI } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  const { user } = useAuth();

  const expenseCategories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
    'Entertainment', 'Healthcare', 'Education', 'Travel', 'Other'
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const response = await budgetAPI.getAll({
        month: formData.month,
        year: formData.year
      });
      setBudgets(response.data.data.budgets || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
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
    
    if (!formData.category || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await budgetAPI.set(formData);
      setFormData({
        category: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      fetchBudgets();
      alert('Budget set successfully!');
    } catch (error) {
      console.error('Error setting budget:', error);
      alert('Error setting budget');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetAPI.delete(id);
        fetchBudgets();
        alert('Budget deleted successfully!');
      } catch (error) {
        console.error('Error deleting budget:', error);
        alert('Error deleting budget');
      }
    }
  };

  const getProgressColor = (usagePercent) => {
    if (usagePercent >= 100) return 'danger';
    if (usagePercent >= 80) return 'warning';
    return 'success';
  };

  return (
    <div>
      <div className="page-header">
        <h1>💼 Set Monthly Budget</h1>
        <p>Plan and track your spending limits</p>
      </div>

      <div className="form-row">
        {/* Set Budget Form */}
        <div className="card">
          <h2>Set New Budget</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Budget Amount ({user?.currency})</label>
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
                <label className="form-label">Month</label>
                <select
                  name="month"
                  className="form-select"
                  value={formData.month}
                  onChange={handleChange}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  name="year"
                  className="form-input"
                  min="2020"
                  max="2030"
                  value={formData.year}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Set Budget
            </button>
          </form>
        </div>

        {/* Current Budgets */}
        <div className="card">
          <h2>Current Month Budgets</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : budgets.length === 0 ? (
            <p className="text-muted text-center">No budgets set for this month</p>
          ) : (
            <div>
              {budgets.map((budget) => (
                <div key={budget._id} className="card" style={{ marginBottom: '15px', padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0 }}>{budget.category}</h4>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                      onClick={() => handleDelete(budget._id)}
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <div className="text-muted">Budget</div>
                      <div style={{ fontWeight: 'bold' }}>{user?.currency}{budget.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted">Spent</div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: budget.spent > budget.amount ? '#e74c3c' : '#27ae60' 
                      }}>
                        {user?.currency}{budget.spent.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted">Remaining</div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: budget.remaining < 0 ? '#e74c3c' : '#27ae60' 
                      }}>
                        {user?.currency}{budget.remaining.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${getProgressColor(budget.usagePercent)}`}
                      style={{ width: `${Math.min(budget.usagePercent, 100)}%` }}
                    ></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span className="text-muted">Usage</span>
                    <span style={{ 
                      color: budget.usagePercent >= 100 ? '#e74c3c' : 
                             budget.usagePercent >= 80 ? '#f39c12' : '#27ae60',
                      fontWeight: 'bold'
                    }}>
                      {budget.usagePercent.toFixed(1)}%
                    </span>
                  </div>

                  {budget.isOverBudget && (
                    <div className="alert alert-warning" style={{ marginTop: '10px', padding: '8px', fontSize: '0.9rem' }}>
                      ⚠️ Over budget by {user?.currency}{Math.abs(budget.remaining).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;