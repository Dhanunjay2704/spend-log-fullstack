import React, { useState, useEffect } from 'react';
import { savingsAPI } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const SavingsGoal = () => {
  const [savingsGoal, setSavingsGoal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goalAmount: '',
    targetDate: '',
    name: '',
    description: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchSavingsGoal();
  }, []);

  const fetchSavingsGoal = async () => {
    setLoading(true);
    try {
      const response = await savingsAPI.get();
      setSavingsGoal(response.data.data);
    } catch (error) {
      console.error('Error fetching savings goal:', error);
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
    
    if (!formData.goalAmount || !formData.targetDate || !formData.name) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await savingsAPI.set(formData);
      setFormData({
        goalAmount: '',
        targetDate: '',
        name: '',
        description: ''
      });
      fetchSavingsGoal();
      alert('Savings goal set successfully!');
    } catch (error) {
      console.error('Error setting savings goal:', error);
      alert('Error setting savings goal: ' + (error.response?.data?.message || 'Please try again'));
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your savings goal?')) {
      try {
        await savingsAPI.delete();
        setSavingsGoal(null);
        alert('Savings goal deleted successfully!');
      } catch (error) {
        console.error('Error deleting savings goal:', error);
        alert('Error deleting savings goal');
      }
    }
  };

  const handleUpdateCurrent = async (newAmount) => {
    try {
      await savingsAPI.update({ currentAmount: newAmount });
      fetchSavingsGoal();
      alert('Current amount updated!');
    } catch (error) {
      console.error('Error updating current amount:', error);
      alert('Error updating current amount');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>🎯 Savings Goal</h1>
          <p>Track your savings progress</p>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>🎯 Savings Goal</h1>
        <p>Track your savings progress</p>
      </div>

      <div className="form-row">
        {/* Set Savings Goal Form */}
        <div className="card">
          <h2>{savingsGoal ? 'Update Savings Goal' : 'Set Savings Goal'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Goal Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g., Emergency Fund, Vacation, Car"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Goal Amount ({user?.currency})</label>
              <input
                type="number"
                name="goalAmount"
                className="form-input"
                placeholder="50000"
                step="0.01"
                min="0.01"
                value={formData.goalAmount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input
                type="date"
                name="targetDate"
                className="form-input"
                value={formData.targetDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Describe your savings goal..."
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              {savingsGoal ? 'Update Goal' : 'Set Goal'}
            </button>
          </form>
        </div>

        {/* Savings Progress */}
        <div className="card">
          <h2>Progress Tracking</h2>
          {!savingsGoal ? (
            <p className="text-muted text-center">No savings goal set yet</p>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>{savingsGoal.name}</h3>
                <p className="text-muted">{savingsGoal.description}</p>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="text-muted">Progress</span>
                  <span style={{ fontWeight: 'bold', color: '#27ae60' }}>
                    {savingsGoal.progress?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill success"
                    style={{ width: `${savingsGoal.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="text-center">
                  <div className="text-muted">Goal Amount</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {user?.currency}{savingsGoal.goalAmount.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-muted">Current Amount</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#27ae60' }}>
                    {user?.currency}{savingsGoal.currentAmount.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-muted">Amount Needed</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {user?.currency}{savingsGoal.amountNeeded.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-muted">Days Remaining</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {savingsGoal.daysRemaining}
                  </div>
                </div>
              </div>

              {/* Daily Savings Needed */}
              {savingsGoal.daysRemaining > 0 && (
                <div className="alert alert-info">
                  <strong>Daily Savings Needed:</strong>{' '}
                  {user?.currency}{savingsGoal.dailySavingsNeeded.toFixed(2)} per day to reach your goal
                </div>
              )}

              {/* Manual Update */}
              <div className="form-group">
                <label className="form-label">Update Current Amount ({user?.currency})</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Current amount"
                    id="currentAmountInput"
                  />
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      const input = document.getElementById('currentAmountInput');
                      if (input.value) {
                        handleUpdateCurrent(parseFloat(input.value));
                        input.value = '';
                      }
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>

              {/* Delete Button */}
              <button 
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '15px' }}
                onClick={handleDelete}
              >
                Delete Goal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavingsGoal;