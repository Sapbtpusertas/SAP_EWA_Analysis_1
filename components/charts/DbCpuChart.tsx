import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartJsData } from '../../types';

interface DbCpuChartProps {
  data: ChartJsData;
}

const DbCpuChart: React.FC<DbCpuChartProps> = ({ data }) => {
  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        border: { display: false },
        ticks: {
          callback: (value: string | number) => value + '%'
        }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return <Line data={data} options={options} />;
};

export default DbCpuChart;
