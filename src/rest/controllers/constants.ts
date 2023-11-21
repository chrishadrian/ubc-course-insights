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
