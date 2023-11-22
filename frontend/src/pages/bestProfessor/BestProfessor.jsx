import React, { useState } from 'react';

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
	const yearDropdown = {
		selectedAttribute: selectedYear,
		setSelectedAttribute: setSelectedYear,
		label: 'Year',
		values: getListOfYears(),
	};
	console.log(yearDropdown);
	return <div>BestProfessor</div>;
}
