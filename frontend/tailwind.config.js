const withMT = require('@material-tailwind/react/utils/withMT');

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
	content: ['./src/**/*.{html,jsx}'],
	theme: { extend: {} },
	plugins: [],
});
