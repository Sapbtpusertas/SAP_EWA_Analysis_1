import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartJsData } from '../../types';

interface DumpsChartProps {
  data: ChartJsData;
}

const DumpsChart: React.FC<DumpsChartProps> = ({ data }) => {
  const options = {
    indexAxis: 'y' as const,
    scales: {
      x: { border: { display: false } },
      y: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return <Bar data={data} options={options} />;
};

export default DumpsChart;
