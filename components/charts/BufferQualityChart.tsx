import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ChartJsData } from '../../types';

interface BufferQualityChartProps {
  data: ChartJsData;
}

const BufferQualityChart: React.FC<BufferQualityChartProps> = ({ data }) => {
  const options = {
    plugins: {
      legend: { position: 'bottom' as const, labels: { padding: 20 } }
    },
    cutout: '70%'
  };

  return <Doughnut data={data} options={options} />;
};

export default BufferQualityChart;
