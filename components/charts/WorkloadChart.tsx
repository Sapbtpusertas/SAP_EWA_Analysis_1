import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartJsData } from '../../types';

interface WorkloadChartProps {
  data: ChartJsData;
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ data }) => {
  const options = {
    scales: {
      y: {
        stacked: true,
        border: { display: false },
        title: { display: true, text: 'Workload (Time in s)' }
      },
      x: {
        stacked: true,
        grid: { display: false }
      }
    },
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 20 } }
    }
  };

  return <Bar data={data} options={options} />;
};

export default WorkloadChart;
