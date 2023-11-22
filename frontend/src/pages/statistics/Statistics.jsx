import { Spinner, Typography, Button } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import DropdownMenus from '../../components/DropdownMenu';
import COURSE_DATA from '../../data/courses.json';
import LineChart from './components/LineChart';

export default function Statistics() {
	const [selectedStats, setSelectedStats] = useState('');
	const [selectedCourse, setSelectedCourse] = useState('');
	const [selectedNumber, setSelectedNumber] = useState('');
	const courseSubjects = COURSE_DATA;
	const [courseNumbers, setCourseNumbers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [statisticResults, setStatisticResult] = useState([]);

	useEffect(() => {
		async function getCourseNumbers() {
			setLoading(true);
			try {
				const response = await fetch(`http://localhost:4321/course/${selectedCourse}/numbers`);
				if (!response.ok) {
					throw new Error(`Failed to fetch data. Status: ${response.status}`);
				}
				const result = await response.json();
				setCourseNumbers(result.result);
			} catch (error) {
				console.error('Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		}

		if (selectedCourse !== '') {
			getCourseNumbers();
		}
	}, [selectedCourse]);

	const courseDropdown = {
		selectedAttribute: selectedCourse,
		setSelectedAttribute: setSelectedCourse,
		label: 'Subject',
		values: courseSubjects,
	};

	const sectionDropdown = {
		selectedAttribute: selectedNumber,
		setSelectedAttribute: setSelectedNumber,
		label: 'Course Number',
		values: courseNumbers,
	};

	const statisticsDropdown = {
		selectedAttribute: selectedStats,
		setSelectedAttribute: setSelectedStats,
		label: 'Statistics',
		values: ['Average', 'Pass', 'Audit', 'Fail'],
	};

	const handleSearchClicked = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`http://localhost:4321/course/${selectedCourse}/${selectedNumber}/${selectedStats}`,
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch data. Status: ${response.status}`);
			}
			const result = await response.json();
			console.log('result: ', result.result);
			setStatisticResult(result.result);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='container mx-auto p-8'>
			{loading ? (
				<div className='w-3/5'>
					<Spinner className='h-16 w-16 text-gray-900/50 mx-auto' />
				</div>
			) : (
				<>
					<Typography variant='h2' className='mb-4'>
						Course Statistics
					</Typography>
					<div className='flex lg:space-x-5'>
						<DropdownMenus attributes={[courseDropdown, sectionDropdown, statisticsDropdown]} />
						<Button
							variant='gradient'
							className='rounded-full h-1/2 w-32 '
							color='light-blue'
							size='md'
							onClick={handleSearchClicked}
						>
							Search
						</Button>
					</div>
					<div>
						<LineChart statisticResults={statisticResults} />
					</div>
				</>
			)}
		</div>
	);
}
