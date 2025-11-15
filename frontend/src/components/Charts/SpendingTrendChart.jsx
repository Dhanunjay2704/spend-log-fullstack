import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SpendingTrendChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`₹${value}`, 'Amount']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#e74c3c" 
          strokeWidth={2}
          dot={{ fill: '#e74c3c', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#c0392b' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SpendingTrendChart;