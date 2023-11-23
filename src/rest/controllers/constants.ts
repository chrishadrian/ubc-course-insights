export const filterCourseSubjectQuery = {
	WHERE: {},
	OPTIONS: {
		COLUMNS: [
			"sections_dept"
		],
		ORDER: {
			dir: "UP",
			keys: ["sections_dept"]
		}
	},
	TRANSFORMATIONS: {
		GROUP: [
			"sections_dept"
		],
		APPLY: [
		]
	}
};

export const filterCourseNumQuery = (subject: string) => {
	return {
		WHERE: {
			IS: {sections_dept: subject}
		},
		OPTIONS: {
			COLUMNS: [
				"sections_id"
			],
			ORDER: {
				dir: "UP",
				keys: ["sections_id"]
			}
		},
		TRANSFORMATIONS: {
			GROUP: [
				"sections_id"
			],
			APPLY: [
			]
		}
	};
};

export const filterCourseStatistics = (subject: string, number: string, statistics: string) => {
	let statQuery = statistics.toLowerCase();
	if (statQuery === "average") {
		statQuery = "avg";
	}

	return {
		WHERE: {
			AND: [
				{IS: {sections_dept: subject}},
				{IS: {sections_id: number}},
				{
					NOT: {
						EQ: {
							sections_year: 1900
						}
					}
				}
			]
		},
		OPTIONS: {
			COLUMNS: [
				"sections_year",
				"statistics"
			],
			ORDER: {
				dir: "UP",
				keys: [
					"sections_year"
				]
			}
		},
		TRANSFORMATIONS: {
			GROUP: [
				"sections_year"
			],
			APPLY: [
				{statistics: {
					AVG: `sections_${statQuery}`
				}}
			]
		}
	};
};

export const filterCourseProfs = (subject: string, num: string, yearsPast: number) => {
	return {
		WHERE: {
			AND: [
				{IS: {sections_dept: subject}},
				{IS: {sections_id: num}},
				{GT: {sections_year: yearsPast}}
			]
		  },
		  OPTIONS: {
			COLUMNS: [
				  "sections_instructor",
				  "overallAvg",
				  "lastYear"
			],
			ORDER: {
				  dir: "DOWN",
				  keys: ["overallAvg"]
			}
		  },
		  TRANSFORMATIONS: {
			GROUP: [
				  "sections_instructor"
			],
			APPLY: [
				{overallAvg: {AVG: "sections_avg"}},
				{lastYear: {MAX: "sections_year"}}
			]
		  }
	};
};
