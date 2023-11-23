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
			text: 'Best Professors',
		},
	},
};

// help from: https://www.geeksforgeeks.org/how-to-create-a-table-in-reactjs/
export default function Table({professorResults}) {
	if (professorResults.length === 0) {
		return <h3>No classes for the selected years, please select an earlier year</h3>
	}
	const avgs = professorResults.map((professorResult) => professorResult.overallAvg);
	const names = professorResults.map((professorResult) => professorResult.sections_instructor);
	const labels = names;

	const data = {
		labels,
		datasets: [
			{
				label: 'Average Course Average',
				data: avgs,
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

	return (
		<table>
			<tr>
				<th>Name</th>
				<th>Overall Average</th>
				<th>Last Teaching Year</th>
			</tr>
			{professorResults.map((professorResult) => {
				return(
					<tr>
						<td>{professorResult.sections_instructor}</td>
						<td>{professorResult.overallAvg}</td>
						<td>{professorResult.lastYear}</td>
					</tr>
				);
			})}
		</table>
	);
}
