import React, { useState, useEffect } from 'react';
import Chart from './components/Chart';
import './App.css';
import { ToggleButton, ToggleButtonGroup, Typography, Box, Paper, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import axios from 'axios';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';

const App = () => {
  const [data, setData] = useState([]);
  const [symbol, setSymbol] = useState('ethusdt');
  const [interval, setInterval] = useState('1m');
  const [darkMode, setDarkMode] = useState(false);
  let ws;

  // Function to fetch historical data
  const fetchHistoricalData = async (symbol, interval) => {
    try {
      const response = await axios.get(BINANCE_API_URL, {
        params: { symbol: symbol.toUpperCase(), interval, limit: 5 },
      });
      const fetchedData = response.data.map((item) => ({
        time: item[0],
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
      }));
      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  // Function to connect to the WebSocket
  const connectWebSocket = () => {
    ws = new WebSocket(`${BINANCE_WS_URL}/${symbol}@kline_${interval}`);
    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (event) => {
      const { k: candlestick } = JSON.parse(event.data);
      if (candlestick.x) {
        const newPoint = {
          time: candlestick.t,
          open: parseFloat(candlestick.o),
          high: parseFloat(candlestick.h),
          low: parseFloat(candlestick.l),
          close: parseFloat(candlestick.c),
        };
        setData((prevData) => [...prevData.slice(1), newPoint]);
      }
    };
    ws.onclose = () => setTimeout(connectWebSocket, 1000);
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close();
    };
  };

  // useEffect to fetch data and connect to WebSocket
  useEffect(() => {
    fetchHistoricalData(symbol, interval);
    connectWebSocket();
    return () => ws && ws.close();
  }, [symbol, interval]);

  // Toggle dark mode
  const toggleDarkMode = () => setDarkMode((prevMode) => !prevMode);

  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Binance Market Data</Typography>
        <IconButton onClick={toggleDarkMode} color="inherit">
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>

      <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, marginBottom: 3 }}>
        <Typography variant="subtitle1">Select Symbol:</Typography>
        <ToggleButtonGroup
          value={symbol}
          exclusive
          onChange={(event, newSymbol) => newSymbol && setSymbol(newSymbol)}
          aria-label="select symbol"
        >
          <ToggleButton value="ethusdt" aria-label="ETH/USDT">ETH/USDT</ToggleButton>
          <ToggleButton value="bnbusdt" aria-label="BNB/USDT">BNB/USDT</ToggleButton>
          <ToggleButton value="dotusdt" aria-label="DOT/USDT">DOT/USDT</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="subtitle1">Select Interval:</Typography>
        <ToggleButtonGroup
          value={interval}
          exclusive
          onChange={(event, newInterval) => newInterval && setInterval(newInterval)}
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
