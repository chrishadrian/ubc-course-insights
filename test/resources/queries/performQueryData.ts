const emptyQuery = {
	input: {
		WHERE: {
			AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "abcd"}}],
		},
		OPTIONS: {
			COLUMNS: ["sections_dept", "sections_avg"],
			ORDER: "sections_avg",
		},
	},
	output: [],
};

const simpleQuery = {
	input: {
		WHERE: {
			AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "math"}}],
		},
		OPTIONS: {
			COLUMNS: ["sections_dept", "sections_avg"],
			ORDER: "sections_avg",
		},
	},
	output: [
		{sections_dept: "math", sections_avg: 97.09},
		{sections_dept: "math", sections_avg: 97.09},
		{sections_dept: "math", sections_avg: 97.25},
		{sections_dept: "math", sections_avg: 97.25},
		{sections_dept: "math", sections_avg: 97.48},
		{sections_dept: "math", sections_avg: 97.48},
		{sections_dept: "math", sections_avg: 99.78},
		{sections_dept: "math", sections_avg: 99.78},
	],
};

const simpleQueryWithNoOrder = {
	input: {
		WHERE: {
			AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "math"}}],
		},
		OPTIONS: {
			COLUMNS: ["sections_dept", "sections_avg"],
		},
	},
	output: [
		{sections_dept: "math", sections_avg: 97.25},
		{sections_dept: "math", sections_avg: 97.25},
		{sections_dept: "math", sections_avg: 99.78},
		{sections_dept: "math", sections_avg: 99.78},
		{sections_dept: "math", sections_avg: 97.48},
		{sections_dept: "math", sections_avg: 97.48},
		{sections_dept: "math", sections_avg: 97.09},
		{sections_dept: "math", sections_avg: 97.09},
	],
};
const complexQuery = {
	input: {
		WHERE: {
			OR: [
				{
					AND: [{GT: {sections_avg: 96}}, {IS: {sections_dept: "math"}}],
				},
				{EQ: {sections_avg: 97}},
			],
		},
		OPTIONS: {
			COLUMNS: ["sections_dept", "sections_id", "sections_avg"],
			ORDER: "sections_avg",
		},
	},
	output: [
		{sections_dept: "math", sections_id: "516", sections_avg: 96.25},
		{sections_dept: "math", sections_id: "516", sections_avg: 96.25},
		{sections_dept: "math", sections_id: "589", sections_avg: 96.33},
		{sections_dept: "math", sections_id: "502", sections_avg: 96.44},
		{sections_dept: "math", sections_id: "502", sections_avg: 96.44},
		{sections_dept: "math", sections_id: "545", sections_avg: 96.83},
		{sections_dept: "math", sections_id: "545", sections_avg: 96.83},
		{sections_dept: "crwr", sections_id: "599", sections_avg: 97},
		{sections_dept: "epse", sections_id: "534", sections_avg: 97},
		{sections_dept: "psyc", sections_id: "549", sections_avg: 97},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
	],
};

const wildCardQueryA = {
	input: {
		WHERE: {
			AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "mat*"}}],
		},
		OPTIONS: {
			COLUMNS: ["sections_dept", "sections_id", "sections_avg"],
			ORDER: "sections_avg",
		},
	},
	output: [
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
	],
};

const wildCardQueryB = {
	input: {
		WHERE: {
			AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "*ath"}}],
		},
		OPTIONS: {
			COLUMNS: ["sections_dept", "sections_id", "sections_avg"],
			ORDER: "sections_avg",
		},
	},
	output: [
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
	],
};

const wildCardQueryC = {
	input: {
		WHERE: {
			AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "*at*"}}],
		},
		OPTIONS: {
			COLUMNS: ["sections_dept", "sections_id", "sections_avg"],
			ORDER: "sections_avg",
		},
	},
	output: [
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
	],
};

const wildCardQueryD = {
	input: {
		WHERE: {AND: [{GT: {sections_avg: 99}}, {IS: {sections_dept: "**"}}]},
		OPTIONS: {COLUMNS: ["sections_dept", "sections_avg"], ORDER: "sections_avg"},
	},
	output: [
		{sections_dept: "cnps", sections_avg: 99.19},
		{sections_dept: "math", sections_avg: 99.78},
		{sections_dept: "math", sections_avg: 99.78},
	],
};

const LTOperatorQuery = {
	input: {
		WHERE: {LT: {sections_audit: 0}},
		OPTIONS: {
			COLUMNS: [
				"sections_uuid",
				"sections_year",
				"sections_title",
				"sections_audit",
				"sections_instructor",
				"sections_fail"
			],
			ORDER: "sections_fail",
		},
	},
	output: [],
};

const SimpleNegationQuery = {
	input: {
		WHERE: {
			NOT: {GT: {sections_avg: 10}},
		},
		OPTIONS: {
			COLUMNS: ["sections_dept", "sections_avg"],
			ORDER: "sections_avg",
		},
	},
	output: [
		{sections_dept: "frst", sections_avg: 0},
		{sections_dept: "lfs", sections_avg: 0},
		{sections_dept: "lfs", sections_avg: 0},
		{sections_dept: "wood", sections_avg: 1},
		{sections_dept: "busi", sections_avg: 4},
		{sections_dept: "busi", sections_avg: 4},
		{sections_dept: "fopr", sections_avg: 4.5},
	],
};

const NegationQuery = {
	input: {
		WHERE: {AND: [{GT: {sections_avg: 96}}, {IS: {sections_dept: "math"}}, {NOT: {LT: {sections_avg: 98}}}]},
		OPTIONS: {COLUMNS: ["sections_dept", "sections_id", "sections_avg"], ORDER: "sections_avg"},
	},
	output: [
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78},
	],
};

const MoreComplexQuery = {
	input: {
		WHERE: {
			OR: [
				{AND: [{GT: {sections_avg: 96}}, {IS: {sections_dept: "math"}}]},
				{AND: [{LT: {sections_avg: 45}}, {IS: {sections_id: "*2*"}}]},
				{EQ: {sections_pass: 620}},
			],
		},
		OPTIONS: {COLUMNS: ["sections_dept", "sections_id", "sections_avg", "sections_pass"], ORDER: "sections_avg"},
	},
	output: [
		{sections_dept: "frst", sections_id: "202", sections_avg: 0, sections_pass: 0},
		{sections_dept: "fopr", sections_id: "362", sections_avg: 4.5, sections_pass: 0},
		{sections_dept: "phil", sections_id: "120", sections_avg: 33.2, sections_pass: 5},
		{sections_dept: "hist", sections_id: "102", sections_avg: 34, sections_pass: 1},
		{sections_dept: "educ", sections_id: "172", sections_avg: 39.03, sections_pass: 39},
		{sections_dept: "educ", sections_id: "172", sections_avg: 39.03, sections_pass: 39},
		{sections_dept: "math", sections_id: "253", sections_avg: 69.68, sections_pass: 620},
		{sections_dept: "math", sections_id: "516", sections_avg: 96.25, sections_pass: 4},
		{sections_dept: "math", sections_id: "516", sections_avg: 96.25, sections_pass: 4},
		{sections_dept: "math", sections_id: "589", sections_avg: 96.33, sections_pass: 3},
		{sections_dept: "math", sections_id: "502", sections_avg: 96.44, sections_pass: 9},
		{sections_dept: "math", sections_id: "502", sections_avg: 96.44, sections_pass: 9},
		{sections_dept: "math", sections_id: "545", sections_avg: 96.83, sections_pass: 6},
		{sections_dept: "math", sections_id: "545", sections_avg: 96.83, sections_pass: 6},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09, sections_pass: 11},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09, sections_pass: 11},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25, sections_pass: 4},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25, sections_pass: 4},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48, sections_pass: 21},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48, sections_pass: 21},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78, sections_pass: 9},
		{sections_dept: "math", sections_id: "527", sections_avg: 99.78, sections_pass: 9},
	],
};

const MoreComplexQueryReturn0 = {
	input: {
		WHERE: {
			OR: [
				{AND: [{GT: {sections_fail: 96}}, {IS: {sections_instructor: "a*"}}]},
				{AND: [{LT: {sections_audit: 0}}, {IS: {sections_title: "*media 1*"}}]},
				{AND: [{EQ: {sections_year: 2023}}, {IS: {sections_uuid: "*123*"}}]},
			],
		},
		OPTIONS: {
			COLUMNS: [
				"sections_uuid",
				"sections_year",
				"sections_title",
				"sections_audit",
				"sections_instructor",
				"sections_fail",
			],
			ORDER: "sections_fail",
		},
	},
	output: [],
};

export {
	emptyQuery,
	simpleQuery,
	simpleQueryWithNoOrder,
	complexQuery,
	wildCardQueryA,
	wildCardQueryB,
	wildCardQueryC,
	wildCardQueryD,
	LTOperatorQuery,
	NegationQuery,
	SimpleNegationQuery,
	MoreComplexQuery,
	MoreComplexQueryReturn0,
};
