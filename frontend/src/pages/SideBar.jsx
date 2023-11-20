/* eslint-disable object-curly-newline */
import { Card, Typography, List, ListItem, ListItemPrefix } from '@material-tailwind/react';
import {
	PresentationChartBarIcon,
	UserCircleIcon,
	Cog6ToothIcon,
	AcademicCapIcon,
	PowerIcon,
} from '@heroicons/react/24/solid';

export default function Sidebar() {
	return (
		<Card className='h-screen w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/20'>
			<div className='mb-2 p-4'>
				<Typography variant='h5' color='blue-gray'>
					UBC Course Insights
				</Typography>
			</div>
			<List>
				<ListItem>
					<ListItemPrefix>
						<PresentationChartBarIcon className='h-5 w-5' />
					</ListItemPrefix>
					Course Statistics
				</ListItem>
				<ListItem>
					<ListItemPrefix>
						<AcademicCapIcon className='h-5 w-5' />
					</ListItemPrefix>
					Best Professor
				</ListItem>
				<hr className='my-2 border-blue-gray-100' />
				<ListItem>
					<ListItemPrefix>
						<UserCircleIcon className='h-5 w-5' />
					</ListItemPrefix>
					Profile
				</ListItem>
				<ListItem>
					<ListItemPrefix>
						<Cog6ToothIcon className='h-5 w-5' />
					</ListItemPrefix>
					Settings
				</ListItem>
				<ListItem>
					<ListItemPrefix>
						<PowerIcon className='h-5 w-5' />
					</ListItemPrefix>
					Log Out
				</ListItem>
			</List>
		</Card>
	);
}
