import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, registerables, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Paper, Typography, Box } from '@mui/material';

// Register necessary components for Chart.js
ChartJS.register(...registerables, BarElement, CategoryScale, LinearScale);

const Chart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    // Destroy previous chart instance to avoid reuse errors
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
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barPercentage: 0.6, // Keep consistent bar width
            categoryPercentage: 0.8, // Control space between bars
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Ensures the chart fills container
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            min: minPrice - yPadding, // Add padding to lower bound
            max: maxPrice + yPadding, // Add padding to upper bound
            title: {
              display: true,
              text: 'Price (USDT)',
            },
            ticks: {
              stepSize: (maxPrice - minPrice) / 5, // Bigger step size for clearer differences
            },
          },
        },
        plugins: {
          legend: { display: true },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#fff',
            borderWidth: 1,
            padding: 10,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [data]);

  return (
    <Paper elevation={3} sx={{ padding: 2, borderRadius: 2, marginTop: 3 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Price Data Chart
      </Typography>
      <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
        <canvas ref={chartRef} />
      </Box>
    </Paper>
  );
};

export default Chart;
