import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const CalendarView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { user } = useAuth();

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, selectedYear]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAll({
        month: selectedMonth,
        year: selectedYear
      });
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getDailyTotals = () => {
    const dailyTotals = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      if (!dailyTotals[date]) {
        dailyTotals[date] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        dailyTotals[date].income += transaction.amount;
      } else {
        dailyTotals[date].expense += transaction.amount;
      }
    });
    
    return dailyTotals;
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const dailyTotals = getDailyTotals();
    
    const calendar = [];
    let dayCounter = 1;

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendar.push({ day: null, income: 0, expense: 0 });
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const totals = dailyTotals[dateString] || { income: 0, expense: 0 };
      
      calendar.push({
        day,
        income: totals.income,
        expense: totals.expense,
        date: dateString
      });
    }

    return calendar;
  };

  const getDayColor = (income, expense) => {
    if (expense > 0) return '#e74c3c';
    if (income > 0) return '#27ae60';
    return '#ecf0f1';
  };

  const calendar = generateCalendar();
  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' });

  return (
    <div>
      <div className="page-header">
        <h1>📅 Calendar View</h1>
        <p>See your spending pattern across the month</p>
      </div>

      {/* Month/Year Selector */}
      <div className="card mb-3">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Month</label>
            <select
              className="form-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Year</label>
            <input
              type="number"
              className="form-input"
              min="2020"
              max="2030"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            />
          </div>

          <button 
            className="btn btn-primary"
            style={{ marginTop: '25px' }}
            onClick={fetchTransactions}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          {monthName} {selectedYear}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div>
            {/* Weekday Headers */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '5px',
              marginBottom: '10px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{ padding: '10px', background: '#f8f9fa' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '5px'
            }}>
              {calendar.map((dayData, index) => (
                <div
                  key={index}
                  style={{
                    minHeight: '80px',
                    padding: '8px',
                    background: getDayColor(dayData.income, dayData.expense),
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {dayData.day && (
                    <>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '0.9rem',
                        color: dayData.income > 0 || dayData.expense > 0 ? 'white' : '#2c3e50'
                      }}>
                        {dayData.day}
                      </div>
                      
                      {(dayData.income > 0 || dayData.expense > 0) && (
                        <div style={{ fontSize: '0.7rem', color: 'white' }}>
                          {dayData.income > 0 && (
                            <div>↑ {user?.currency}{dayData.income}</div>
                          )}
                          {dayData.expense > 0 && (
                            <div>↓ {user?.currency}{dayData.expense}</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '20px', 
              marginTop: '20px',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', background: '#27ae60', borderRadius: '3px' }}></div>
                <span>Income Day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', background: '#e74c3c', borderRadius: '3px' }}></div>
                <span>Expense Day</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '15px', height: '15px', background: '#ecf0f1', borderRadius: '3px', border: '1px solid #ddd' }}></div>
                <span>No Activity</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;