import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartJsData } from '../../types';

interface LargestTablesChartProps {
    data: ChartJsData;
}

const LargestTablesChart: React.FC<LargestTablesChartProps> = ({ data }) => {
    const options = {
        scales: {
            y: {
                border: { display: false },
                title: { display: true, text: 'Size (GB)' }
            },
            x: {
                grid: { display: false }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };
    return <Bar data={data} options={options} />;
};

export default LargestTablesChart;
