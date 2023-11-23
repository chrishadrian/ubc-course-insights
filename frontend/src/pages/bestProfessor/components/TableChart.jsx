/* eslint-disable object-curly-newline */
import { Card, Typography } from '@material-tailwind/react';
import React from 'react';
import TableData from './TableData';

const TABLE_HEAD = ['Name', 'Overall Average', 'Last Teaching Year'];

// https://www.material-tailwind.com/docs/react/table
export default function TableChart({ professorResults }) {
	if (professorResults.length === 0) {
		return <h3>No classes for the selected years, please select an earlier year</h3>;
	}

	return (
		<Card className='h-full w-full overflow-scroll border-x-[1px]'>
			<table className='w-full min-w-max table-auto text-left'>
				<thead>
					<tr>
						{TABLE_HEAD.map((head) => (
							<th key={head} className='border-b border-blue-gray-100 bg-blue-gray-50 p-4'>
								<Typography
									variant='small'
									color='blue-gray'
									className='font-normal leading-none opacity-70'
								>
									{head}
								</Typography>
							</th>
						))}
					</tr>
				</thead>
				<TableData results={professorResults} />
			</table>
		</Card>
	);
}
