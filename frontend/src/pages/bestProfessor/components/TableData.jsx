import { Typography } from '@material-tailwind/react';

export default function TableData({ results }) {
	console.log('results: ', results);
	const data = results.map((result) => ({
		name: result.sections_instructor,
		avg: result.overallAvg,
		year: result.lastYear,
	}));

	return (
		<tbody>
			{data.map(({ name, avg, year }) => (
				<tr key={name} className='even:bg-blue-gray-50/70'>
					<td className='p-4'>
						<Typography variant='small' color='blue-gray' className='font-normal'>
							{name}
						</Typography>
					</td>
					<td className='p-4'>
						<Typography variant='small' color='blue-gray' className='font-normal'>
							{avg}
						</Typography>
					</td>
					<td className='p-4'>
						<Typography variant='small' color='blue-gray' className='font-normal'>
							{year}
						</Typography>
					</td>
				</tr>
			))}
		</tbody>
	);
}
