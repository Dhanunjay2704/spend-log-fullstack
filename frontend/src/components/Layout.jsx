import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/transactions', icon: '➕', label: 'Add Transaction' },
    { path: '/budgets', icon: '💼', label: 'Set Budget' },
    { path: '/savings', icon: '🎯', label: 'Savings Goal' },
    { path: '/calendar', icon: '📅', label: 'Calendar View' },
    { path: '/export', icon: '📤', label: 'Export Data' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>💰 Spend Log</h1>
          <p>Smart Finance Tracker</p>
        </div>
        
        <ul className="sidebar-nav">
          {menuItems.map((item) => (
            <li key={item.path}>
              <a 
                href={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* User Info & Logout */}
        <div style={{ padding: '20px', marginTop: 'auto', borderTop: '1px solid #34495e' }}>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#ecf0f1', fontWeight: 'bold' }}>{user?.name}</p>
            <p style={{ color: '#bdc3c7', fontSize: '0.8rem' }}>{user?.email}</p>
          </div>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', color: '#bdc3c7', borderColor: '#bdc3c7' }}
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;