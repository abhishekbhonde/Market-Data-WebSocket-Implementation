import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, registerables, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Paper, Typography, Box, useTheme } from '@mui/material';

// Register necessary components for Chart.js
ChartJS.register(...registerables, BarElement, CategoryScale, LinearScale);

const Chart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const theme = useTheme(); // Get the current theme

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    // Destroy the previous chart instance to avoid reuse errors
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Calculate min/max prices for better scaling
    const prices = data.map((d) => d.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Add padding to min and max for better visual separation
    const yPadding = (maxPrice - minPrice) * 0.3; // 30% padding

    // Create new Chart instance
    chartInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: data.map((d) => new Date(d.time).toLocaleTimeString()), // Time labels
        datasets: [
          {
            label: 'Closing Price (USDT)',
            data: prices,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(100, 181, 246, 0.7)'  // Light blue in dark mode
              : 'rgba(75, 192, 192, 0.7)',   // Default in light mode
            borderColor: theme.palette.mode === 'dark' 
              ? 'rgba(100, 181, 246, 1)' 
              : 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
              color: theme.palette.text.primary, // Dynamic color based on theme
            },
            ticks: {
              color: theme.palette.text.primary, // X-axis tick color
            },
          },
          y: {
            min: minPrice - yPadding,
            max: maxPrice + yPadding,
            title: {
              display: true,
              text: 'Price (USDT)',
              color: theme.palette.text.primary, // Y-axis title color
            },
            ticks: {
              color: theme.palette.text.primary, // Y-axis tick color
              stepSize: (maxPrice - minPrice) / 5,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: theme.palette.text.primary, // Legend text color
            },
          },
          tooltip: {
            backgroundColor: theme.palette.background.paper, // Tooltip background
            titleColor: theme.palette.text.primary, // Tooltip title color
            bodyColor: theme.palette.text.primary, // Tooltip body color
            borderColor: theme.palette.divider, // Border for better contrast
            borderWidth: 1,
            padding: 10,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data, theme]); // Recreate chart when data or theme changes

  return (
    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, marginTop: 3, background: theme.palette.background.paper }}>
      <Typography variant="h6" align="center" gutterBottom sx={{ color: theme.palette.text.primary }}>
        Price Data Chart
      </Typography>
      <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
        <canvas ref={chartRef} />
      </Box>
    </Paper>
  );
};

export default Chart;
