import { Spinner, Typography, Button } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import DropdownMenus from '../../components/DropdownMenu';
import COURSE_DATA from '../../data/courses.json';
import Table from './components/Table';
import CreateDropdownMenu from '../../utils/DropdownHelper';

const STARTING_YEAR = 2010;

// https://stackoverflow.com/questions/1575271/range-of-years-in-javascript-for-a-select-box
function getListOfYears() {
	const currentYear = new Date().getFullYear();
	const years = [];
	let startYear = STARTING_YEAR;
	while (startYear <= currentYear) {
		years.push(startYear.toString());
		startYear += 1;
	}
	return years;
}

export default function BestProfessor() {
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
	const [selectedCourse, setSelectedCourse] = useState('');
	const [selectedNumber, setSelectedNumber] = useState('');
	const [courseNumbers, setCourseNumbers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [professorResults, setProfessorResult] = useState([]);

	const courseSubjects = COURSE_DATA;

	useEffect(() => {
		async function getCourseNumbers() {
			setLoading(true);
			try {
				const response = await fetch(`http://localhost:4321/professor/${selectedCourse}/numbers`);
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

	// console.log(yearDropdown);

	const courseDropdown = CreateDropdownMenu(selectedCourse, setSelectedCourse, 'Subject', courseSubjects);

	const sectionDropdown = CreateDropdownMenu(selectedNumber, setSelectedNumber, 'Course Number', courseNumbers);

	const yearDropdown = CreateDropdownMenu(selectedYear, setSelectedYear, 'Year', getListOfYears());

	// const yearDropdown = {
	// 	selectedAttribute: selectedYear,
	// 	setSelectedAttribute: setSelectedYear,
	// 	label: 'Year',
	// 	values: getListOfYears(),
	// };

	const handleSearchClicked = async () => {
		setLoading(true);
		try {
			const response = await fetch(
				`http://localhost:4321/professor/${selectedCourse}/${selectedNumber}/${selectedYear}`,
			);
			if (!response.ok) {
				throw new Error(`Failed to fetch data. Status: ${response.status}`);
			}
			const result = await response.json();
			setProfessorResult(result.result);
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
						Best Professors
					</Typography>
					<div className='flex lg:space-x-5'>
						<DropdownMenus attributes={[courseDropdown, sectionDropdown, yearDropdown]} />
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
						<Table professorResults={professorResults} />
					</div>
				</>
			)}
		</div>
	);
}
