import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ChartJsData } from '../../types';

interface ResponseBreakdownChartProps {
    data: ChartJsData;
}

const ResponseBreakdownChart: React.FC<ResponseBreakdownChartProps> = ({ data }) => {
    const options = {
        plugins: {
            legend: { position: 'right' as const, labels: { padding: 20 } }
        },
        cutout: '70%'
    };

    return <Doughnut data={data} options={options} />;
};

export default ResponseBreakdownChart;
