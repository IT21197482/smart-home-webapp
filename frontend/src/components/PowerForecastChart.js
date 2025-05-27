import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const PowerForecastChart = ({ data }) => {
  return (
    <div className="card">
      <h3>24-Hour Power Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis unit=" W" />
          <Tooltip />
          <Line type="monotone" dataKey="power" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PowerForecastChart;
