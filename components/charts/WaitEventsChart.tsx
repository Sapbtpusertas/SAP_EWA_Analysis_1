import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartJsData } from '../../types';

interface WaitEventsChartProps {
  data: ChartJsData;
}

const WaitEventsChart: React.FC<WaitEventsChartProps> = ({ data }) => {
  const options = {
    indexAxis: 'y' as const,
    scales: {
      x: { border: { display: false }, title: { display: true, text: 'Time (ms)'} },
      y: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return <Bar data={data} options={options} />;
};

export default WaitEventsChart;
