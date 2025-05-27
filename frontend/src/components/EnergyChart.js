import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const EnergyChart = ({ data }) => {
  return (
    <div style={{ marginTop: '30px' }}>
      <h3>Monthly Usage Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis unit=" kWh" />
          <Tooltip />
          <Line type="monotone" dataKey="kwh" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyChart;
