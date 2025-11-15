import React, { useState } from 'react';
import { transactionAPI } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Export = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const exportToCSV = async () => {
    setExporting(true);
    try {
      const response = await transactionAPI.getAll({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const transactions = response.data.data;
      
      if (transactions.length === 0) {
        alert('No data found for the selected date range');
        return;
      }

      // Create CSV content
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(transaction => [
          new Date(transaction.date).toLocaleDateString(),
          transaction.type,
          transaction.category,
          transaction.amount,
          `"${transaction.description || ''}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spend_log_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = async () => {
    setExporting(true);
    try {
      const response = await transactionAPI.getAll({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      const transactions = response.data.data;
      
      if (transactions.length === 0) {
        alert('No data found for the selected date range');
        return;
      }

      // Create JSON content
      const jsonContent = JSON.stringify(transactions, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spend_log_${dateRange.startDate}_to_${dateRange.endDate}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>📤 Export Data</h1>
        <p>Download your financial data for analysis</p>
      </div>

      <div className="card">
        <h2>Export Your Data</h2>
        
        {/* Date Range Selector */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="form-input"
              value={dateRange.startDate}
              onChange={handleDateChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              className="form-input"
              value={dateRange.endDate}
              onChange={handleDateChange}
            />
          </div>
        </div>

        {/* Export Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <div className="card text-center" style={{ padding: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📄</div>
            <h3>CSV Export</h3>
            <p className="text-muted mb-3">
              Download your data as CSV file for Excel, Google Sheets, or other spreadsheet applications
            </p>
            <button 
              className="btn btn-primary"
              onClick={exportToCSV}
              disabled={exporting}
            >
              {exporting ? <div className="loading-spinner"></div> : 'Download CSV'}
            </button>
          </div>

          <div className="card text-center" style={{ padding: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📊</div>
            <h3>JSON Export</h3>
            <p className="text-muted mb-3">
              Download your data as JSON file for developers or data analysis tools
            </p>
            <button 
              className="btn btn-primary"
              onClick={exportToJSON}
              disabled={exporting}
            >
              {exporting ? <div className="loading-spinner"></div> : 'Download JSON'}
            </button>
          </div>
        </div>

        {/* Information */}
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          <h4>Export Information</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>CSV files can be opened in Excel, Google Sheets, or any spreadsheet application</li>
            <li>JSON files are useful for developers and data analysis</li>
            <li>All your transaction data will be included in the export</li>
            <li>Export includes: Date, Type, Category, Amount, and Description</li>
          </ul>
        </div>

        {/* Coming Soon Features */}
        <div className="card" style={{ background: '#f8f9fa', marginTop: '20px' }}>
          <h3 style={{ color: '#7f8c8d' }}>Coming Soon Features</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
              <div style={{ fontWeight: 'bold' }}>PDF Reports</div>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                Beautiful PDF reports with charts and insights
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📧</div>
              <div style={{ fontWeight: 'bold' }}>Email Export</div>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                Send reports directly to your email
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;