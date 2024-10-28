import React, { useState, useEffect } from 'react';
import Chart from './components/Chart';
import './App.css'; // Include a separate CSS file for App
import { ToggleButton, ToggleButtonGroup, Typography, Box, Paper } from '@mui/material';
import axios from 'axios';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

const App = () => {
  const [data, setData] = useState([]);
  const [symbol, setSymbol] = useState('ethusdt'); // Default symbol
  const [interval, setInterval] = useState('1m'); // Default interval
  let ws; // Declare WebSocket outside of `useEffect` for proper scope

  // Function to fetch historical data from Binance API
  const fetchHistoricalData = async (symbol, interval) => {
    try {
      const response = await axios.get(BINANCE_API_URL, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          limit: 5, // Limit to the last 5 data points
        },
      });

      // Map the response to the required format
      const fetchedData = response.data.map((item) => ({
        time: item[0], // Open time
        open: parseFloat(item[1]), // Open price
        high: parseFloat(item[2]), // High price
        low: parseFloat(item[3]), // Low price
        close: parseFloat(item[4]), // Close price
      }));

      setData(fetchedData); // Update state with fetched data
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const connectWebSocket = () => {
    ws = new WebSocket(`${BINANCE_WS_URL}/${symbol}@kline_${interval}`);

    ws.onopen = () => console.log('WebSocket connected');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const candlestick = message.k;

      if (candlestick.x) { // Only update when the candlestick closes
        const newPoint = {
          time: candlestick.t,
          open: parseFloat(candlestick.o),
          high: parseFloat(candlestick.h),
          low: parseFloat(candlestick.l),
          close: parseFloat(candlestick.c),
        };

        // Update the data to ensure we have exactly 5 points for each interval
        setData((prevData) => {
          const updatedData = [...prevData, newPoint];
          return updatedData.slice(-5); // Keep only the last 5 points
        });
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting...');
      setTimeout(connectWebSocket, 1000); // Reconnect after 1 second
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close(); // Close WebSocket on error to trigger reconnection
    };
  };

  useEffect(() => {
    // Fetch initial historical data when the component mounts
    fetchHistoricalData(symbol, interval);
    connectWebSocket(); // Initialize WebSocket

    return () => {
      if (ws) ws.close(); // Clean up WebSocket on unmount
    };
  }, []); // Run only on mount

  const handleSymbolChange = (event, newSymbol) => {
    if (newSymbol) {
      setSymbol(newSymbol);
      fetchHistoricalData(newSymbol, interval); // Fetch data for new symbol
    }
  };

  const handleIntervalChange = (event, newInterval) => {
    if (newInterval) {
      setInterval(newInterval);
      fetchHistoricalData(symbol, newInterval); // Fetch data for new interval
    }
  };

  return (
    <div className="container">
      <Typography variant="h4" align="center" gutterBottom>
        Binance Market Data
      </Typography>
      <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="subtitle1">Select Symbol:</Typography>
        <ToggleButtonGroup
          value={symbol}
          exclusive
          onChange={handleSymbolChange}
          aria-label="select symbol"
          sx={{ marginBottom: 2 }}
        >
          <ToggleButton value="ethusdt" aria-label="ETH/USDT">ETH/USDT</ToggleButton>
          <ToggleButton value="bnbusdt" aria-label="BNB/USDT">BNB/USDT</ToggleButton>
          <ToggleButton value="dotusdt" aria-label="DOT/USDT">DOT/USDT</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="subtitle1">Select Interval:</Typography>
        <ToggleButtonGroup
          value={interval}
          exclusive
          onChange={handleIntervalChange}
          aria-label="select interval"
        >
          <ToggleButton value="1m" aria-label="1 Minute">1 Min</ToggleButton>
          <ToggleButton value="3m" aria-label="3 Minutes">3 Min</ToggleButton>
          <ToggleButton value="5m" aria-label="5 Minutes">5 Min</ToggleButton>
        </ToggleButtonGroup>
      </Paper>
      <Chart data={data} />
    </div>
  );
};

export default App;
