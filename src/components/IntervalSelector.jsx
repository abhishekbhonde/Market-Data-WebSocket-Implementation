import React from 'react';

const IntervalSelector = ({ onChange, selected }) => {
  const intervals = ['1m', '3m', '5m'];

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border rounded"
    >
      {intervals.map((interval) => (
        <option key={interval} value={interval}>
          {interval}
        </option>
      ))}
    </select>
  );
};

export default IntervalSelector;
