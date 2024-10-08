import { Spinner, Typography, Button } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import DropdownMenus from '../../components/DropdownMenu';
import COURSE_DATA from '../../data/courses.json';
import LineChart from './components/LineChart';
import CreateDropdownMenu from '../../utils/DropdownHelper';

export default function Statistics() {
	const [selectedCourse, setSelectedCourse] = useState('');
	const [selectedNumber, setSelectedNumber] = useState('');
	const [selectedStats, setSelectedStats] = useState('Average');
	const [courseNumbers, setCourseNumbers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [statisticResults, setStatisticResult] = useState(null);
	const [courseError, setCourseError] = useState(false);
	const [numberError, setNumberError] = useState(false);

	const courseSubjects = COURSE_DATA;
	const statisticsOptions = ['Average', 'Pass', 'Audit', 'Fail'];

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
			setCourseError(false);
			getCourseNumbers();
		}
	}, [selectedCourse]);

	useEffect(() => {
		if (selectedNumber !== '') {
			setNumberError(false);
		}
	}, [selectedNumber]);

	const courseDropdown = CreateDropdownMenu(selectedCourse, setSelectedCourse, 'Subject', courseSubjects);
	const sectionDropdown = CreateDropdownMenu(selectedNumber, setSelectedNumber, 'Course Number', courseNumbers);
	const statisticsDropdown = CreateDropdownMenu(selectedStats, setSelectedStats, 'Statistics', statisticsOptions);

	const handleSearchClicked = async () => {
		if (selectedCourse === '') {
			setCourseError(true);
		} else {
			setCourseError(false);
		}

		if (selectedNumber === '') {
			setNumberError(true);
		} else {
			setNumberError(false);
		}

		setLoading(true);
		try {
			const response = await fetch(
				`http://localhost:4321/course/${selectedCourse}/${selectedNumber}/${selectedStats}`,
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch data. Status: ${response.status}`);
			}
			const result = await response.json();
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
						<DropdownMenus
							attributes={[courseDropdown, sectionDropdown, statisticsDropdown]}
							errors={{ courseError, numberError }}
						/>
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
					<div>{statisticResults && <LineChart statisticResults={statisticResults} />}</div>
				</>
			)}
		</div>
	);
}
