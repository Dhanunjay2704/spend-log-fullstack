import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IncomeExpenseBarChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#27ae60" name="Income" />
        <Bar dataKey="expense" fill="#e74c3c" name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeExpenseBarChart;