import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartJsData } from '../../types';


interface TrendChartProps {
  data: ChartJsData;
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const options = {
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Response Time (ms)' },
        border: { display: false }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: 'DB Size (GB)' },
        grid: { display: false }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 20 } }
    }
  };

  return <Line data={data} options={options} />;
};

export default TrendChart;
