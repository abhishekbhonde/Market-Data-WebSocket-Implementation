import React from 'react';

const CoinToggle = ({ onChange, selected }) => {
  const coins = ['ethusdt', 'bnbusdt', 'dotusdt'];

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border rounded"
    >
      {coins.map((coin) => (
        <option key={coin} value={coin}>
          {coin.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

export default CoinToggle;
