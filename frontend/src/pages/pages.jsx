import Statistics from './statistics/Statistics';
import BestProfessor from './bestProfessor/BestProfessor';

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
