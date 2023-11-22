/* eslint-disable object-curly-newline */
import React from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options = {
	responsive: true,
	plugins: {
		legend: {
			position: 'top',
		},
		title: {
			display: true,
			text: 'Course Statistics',
		},
	},
};

export default function LineChart({ statisticResults }) {
	const years = statisticResults.map((statisticResult) => statisticResult.sections_year);
	const statistics = statisticResults.map((statisticResult) => statisticResult.statistics);
	const labels = years;

	const data = {
		labels,
		datasets: [
			{
				label: 'Average',
				data: statistics,
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgba(255, 99, 132, 0.5)',
			},
			// {
			// 	label: 'Dataset 2',
			// 	data: labels.map(() => faker.datatype.number({ min: -1000, max: 1000 })),
			// 	borderColor: 'rgb(53, 162, 235)',
			// 	backgroundColor: 'rgba(53, 162, 235, 0.5)',
			// },
		],
	};

	console.log('data: ', data);

	return <Line options={options} data={data} />;
}
