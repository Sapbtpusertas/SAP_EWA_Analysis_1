import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartJsData } from '../../types';


interface GrowingTablesChartProps {
    data: ChartJsData;
}

const GrowingTablesChart: React.FC<GrowingTablesChartProps> = ({ data }) => {
    const options = {
        scales: {
            y: {
                border: { display: false },
                title: { display: true, text: 'Growth (GB/Month)' }
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

export default GrowingTablesChart;
