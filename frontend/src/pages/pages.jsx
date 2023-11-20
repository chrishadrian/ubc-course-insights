import BestProfessor from './bestProfessor/BestProfessor';
import Statistics from './statistics/Statistics';

const pages = [
	{
		name: 'Course Statistics',
		path: '/',
		element: <Statistics />,
	},
	{
		name: 'Best Professor',
		path: '/bestprofessor',
		element: <BestProfessor />,
	},
];

export default pages;
