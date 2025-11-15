import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import IncomeExpenseBarChart from '../components/Charts/IncomeExpenseBarChart';
import SpendingTrendChart from '../components/Charts/SpendingTrendChart';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await transactionAPI.getStats({
        month: currentMonth,
        year: currentYear
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const getCategoryChartData = () => {
    if (!stats?.categorySpending) return [];
    
    return Object.entries(stats.categorySpending).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getIncomeExpenseData = () => {
    if (!stats?.totals) return [];
    
    return [
      {
        name: 'Current Month',
        income: stats.totals.income,
        expense: stats.totals.expenses
      }
    ];
  };

  const getTrendChartData = () => {
    if (!stats?.dailySpending) return [];
    
    return stats.dailySpending.map(day => ({
      date: new Date(day.date).toLocaleDateString(),
      amount: day.amount
    }));
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1>📊 Financial Dashboard</h1>
          <p>Track expenses, set budgets, and achieve your financial goals</p>
        </div>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
          <p className="text-muted mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <div className="page-header">
          <h1>📊 Financial Dashboard</h1>
          <p>Track expenses, set budgets, and achieve your financial goals</p>
        </div>
        <div className="alert alert-info">
          <h3>Welcome to Spend Log! 🎉</h3>
          <p>Start by adding your first transaction to see your financial insights.</p>
        </div>
      </div>
    );
  }

  const { totals, noSpendDays, daysInMonth } = stats;
  const daysElapsed = currentDate.getDate();
  const avgDailySpend = totals.expenses / daysElapsed;
  const projectedSpend = avgDailySpend * daysInMonth;

  return (
    <div>
      <div className="page-header">
        <h1>📊 Financial Dashboard</h1>
        <p>Track expenses, set budgets, and achieve your financial goals</p>
      </div>

      {/* Spending Insights */}
      <div className="card mb-3">
        <h2>💰 Spending Insights</h2>
        <div className="metrics-grid">
          <div className="metric-card pulse">
            <div className="metric-label">💓 Spending Pulse</div>
            <div className="metric-value">{user?.currency}{avgDailySpend.toFixed(2)}/day</div>
            <div>Projected: {user?.currency}{projectedSpend.toLocaleString()}</div>
          </div>

          <div className="metric-card pulse">
            <div className="metric-label">🚫 No-Spend Days</div>
            <div className="metric-value">{noSpendDays}</div>
            <div>{((noSpendDays / daysElapsed) * 100).toFixed(0)}% of days</div>
          </div>

          <div className="metric-card pulse">
            <div className="metric-label">📅 Weekly Allowance</div>
            <div className="metric-value">{user?.currency}{(totals.income / 4).toFixed(2)}</div>
            <div>Weekly budget</div>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="metrics-grid mb-3">
        <div className="metric-card income">
          <div className="metric-label">💵 Total Income</div>
          <div className="metric-value">{user?.currency}{totals.income.toLocaleString()}</div>
          <div>This month</div>
        </div>

        <div className="metric-card expense">
          <div className="metric-label">💸 Total Expenses</div>
          <div className="metric-value">{user?.currency}{totals.expenses.toLocaleString()}</div>
          <div>This month</div>
        </div>

        <div className="metric-card savings">
          <div className="metric-label">💰 Net Savings</div>
          <div className="metric-value">{user?.currency}{totals.netSavings.toLocaleString()}</div>
          <div>Income - Expenses</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">📈 Savings Rate</div>
          <div className="metric-value">{totals.savingsRate.toFixed(1)}%</div>
          <div>Of total income</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid mb-3">
        <div className="chart-container">
          <h3>Spending by Category</h3>
          {getCategoryChartData().length > 0 ? (
            <ExpensePieChart data={getCategoryChartData()} />
          ) : (
            <div style={{ 
              height: '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p className="text-muted">No expense data available for chart</p>
            </div>
          )}
        </div>

        <div className="chart-container">
          <h3>Income vs Expenses</h3>
          {getIncomeExpenseData().length > 0 ? (
            <IncomeExpenseBarChart data={getIncomeExpenseData()} />
          ) : (
            <div style={{ 
              height: '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p className="text-muted">No transaction data available for chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spending Trend */}
      <div className="card">
        <h3>📅 Daily Spending Trend</h3>
        {getTrendChartData().length > 0 ? (
          <SpendingTrendChart data={getTrendChartData()} />
        ) : (
          <div style={{ 
            height: '200px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p className="text-muted">No daily spending data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;