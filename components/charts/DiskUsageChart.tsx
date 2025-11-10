
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ChartJsData } from '../../types';

// FIX: This component was hardcoded. It now accepts a `data` prop to display dynamic data.
interface DiskUsageChartProps {
    data: ChartJsData;
}

const options = {
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
      }
    }
  },
  cutout: '70%'
};

const DiskUsageChart: React.FC<DiskUsageChartProps> = ({ data }) => {
  return <Doughnut data={data} options={options} />;
};

export default DiskUsageChart;
