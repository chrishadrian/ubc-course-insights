import { Typography } from '@material-tailwind/react';
import React, { useState } from 'react';
import DropdownMenu from '../../components/DropdownMenu';

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
export default function Statistics() {
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
	const [selectedCourse, setSelectedCourse] = useState('');
	const [selectedSection, setSelectedSection] = useState('');
	const yearDropdown = {
		selectedAttribute: selectedYear,
		setSelectedAttribute: setSelectedYear,
		label: 'Select Year',
		values: getListOfYears(),
	};

	const courseDropdown = {
		selectedAttribute: selectedCourse,
		setSelectedAttribute: setSelectedCourse,
		label: 'Select Course',
		values: ['CPSC', 'MATH'],
	};

	const sectionDropdown = {
		selectedAttribute: selectedSection,
		setSelectedAttribute: setSelectedSection,
		label: 'Select Section',
		values: ['101', '102'],
	};

	return (
		<div className='container mx-auto p-8'>
			<Typography variant='h2' className='mb-4'>
				Course Statistics
			</Typography>
			<DropdownMenu attributes={[yearDropdown, courseDropdown, sectionDropdown]} />
		</div>
	);
}
