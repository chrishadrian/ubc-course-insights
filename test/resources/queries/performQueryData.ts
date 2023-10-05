/* eslint-disable max-len */
/* eslint-disable max-lines */
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

const exceedLimitQuery = {
	WHERE: {GT: {large_avg: 0}},
	OPTIONS: {
		COLUMNS: ["large_avg"],
		ORDER: "large_avg",
	},
};

const invalidStringQuery = {WHERE: {GT: {sections_avg: 90}}};

const invalidFormatQuery = {
	WHERE: {
		AND: [{GT: {sections_avg: 90}}],
		IS: {sections_dept: "adh*"},
	},
	OPTIONS: {
		COLUMNS: ["sections_dept", "sections_id", "sections_avg"],
		ORDER: "sections_avg",
	},
};

const invalidReferenceQuery = {
	WHERE: {
		AND: [{GT: {abc_avg: 97}}, {IS: {abc_dept: "math"}}],
	},
	OPTIONS: {
		COLUMNS: ["abc_dept", "abc_avg"],
		ORDER: "abc_avg",
	},
};

const invalidEBNFType = {
	WHERE: {
		AND: [{GT: {sections_avg: "97"}}, {IS: {sections_dept: "math"}}],
	},
	OPTIONS: {
		COLUMNS: ["sections_dept", "sections_avg"],
		ORDER: "sections_avg",
	},
};

const invalidEBNFKey = {
	WHERE: {
		AND: [{GT: {sections_avg: 97}}, {IS: {sections_1_dept: "math"}}],
	},
	OPTIONS: {
		COLUMNS: ["sections_dept", "sections_avg"],
		ORDER: "sections_avg",
	},
};

const invalidEBNFMissingWhere = {
	OPTIONS: {
		COLUMNS: ["sections_dept", "sections_avg"],
		ORDER: "sections_avg",
	},
};

const invalidEBNFInvalidWhereType = {
	WHERE: "",
	OPTIONS: {
		COLUMNS: ["sections_dept", "sections_id", "sections_avg"],
		ORDER: "sections_avg",
	},
};

const invalidEBNFMissingOptions = {
	WHERE: {
		AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "math"}}],
	},
};

const invalidEBNFMissingColumns = {
	WHERE: {
		AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "math"}}],
	},
	OPTIONS: {ORDER: "sections_avg"},
};

const invalidEBNFInvalidColumnsType = {
	WHERE: {
		AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "*at*"}}],
	},
	OPTIONS: {
		COLUMNS: "abc",
		ORDER: ["sections_avg", "sections_id"],
	},
};

const invalidEBNFEmptyColumns = {
	WHERE: {
		AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "*at*"}}],
	},
	OPTIONS: {
		COLUMNS: [],
		ORDER: "sections_avg",
	},
};

const invalidEBNFInvalidOrderKey = {
	WHERE: {
		AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "math"}}],
	},
	OPTIONS: {
		COLUMNS: ["sections_dept", "sections_avg"],
		ORDER: "sections_id",
	},
};

const invalidEBNFInvalidOrderType = {
	WHERE: {
		AND: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "*at*"}}],
	},
	OPTIONS: {
		COLUMNS: ["sections_dept", "sections_id", "sections_avg"],
		ORDER: ["sections_avg", "sections_id"],
	},
};

const invalidEBNFFilterKey = {
	WHERE: {
		ANAD: [{GT: {sections_avg: 97}}, {IS: {sections_dept: "math"}}],
	},
	OPTIONS: {
		COLUMNSS: ["sections_dept", "sections_avg"],
		ORDER: "sections_avg",
	},
};

const invalidMultipleIDsQuery = {
	WHERE: {
		AND: [{GT: {sections_avg: 97}}, {IS: {ubc_dept: "math"}}],
	},
	OPTIONS: {
		COLUMNS: ["sections_dept", "sections_avg"],
		ORDER: "sections_avg",
	},
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
				"sections_fail",
			],
			ORDER: "sections_fail",
		},
	},
	output: [],
};

const NegationQuery = {
	input: {
		WHERE: {AND: [{GT: {sections_avg: 96}}, {IS: {sections_dept: "math"}}, {NOT: {GT: {sections_avg: 98}}}]},
		OPTIONS: {COLUMNS: ["sections_dept", "sections_id", "sections_avg"], ORDER: "sections_avg"},
	},
	output: [
		{sections_dept: "math", sections_id: "516", sections_avg: 96.25},
		{sections_dept: "math", sections_id: "516", sections_avg: 96.25},
		{sections_dept: "math", sections_id: "589", sections_avg: 96.33},
		{sections_dept: "math", sections_id: "502", sections_avg: 96.44},
		{sections_dept: "math", sections_id: "502", sections_avg: 96.44},
		{sections_dept: "math", sections_id: "545", sections_avg: 96.83},
		{sections_dept: "math", sections_id: "545", sections_avg: 96.83},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "541", sections_avg: 97.09},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "525", sections_avg: 97.25},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
		{sections_dept: "math", sections_id: "532", sections_avg: 97.48},
	],
};

const FilterWithNoOptionQuery = {
	input: {
		WHERE: {GT: {sections_audit: 15}},
		OPTIONS: {
			COLUMNS: ["sections_uuid", "sections_year", "sections_title", "sections_instructor", "sections_fail"],
			ORDER: "sections_fail",
		},
	},
	output: [
		{
			sections_uuid: "62474",
			sections_year: 2015,
			sections_title: "machine learn i",
			sections_instructor: "schmidt, mark",
			sections_fail: 0,
		},
		{
			sections_uuid: "62475",
			sections_year: 1900,
			sections_title: "machine learn i",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "97727",
			sections_year: 2013,
			sections_title: "mult regres meth",
			sections_instructor: "lemay, valerie;tait, david e n",
			sections_fail: 0,
		},
		{
			sections_uuid: "97728",
			sections_year: 1900,
			sections_title: "mult regres meth",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "21789",
			sections_year: 1900,
			sections_title: "eval src evidenc",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "76489",
			sections_year: 1900,
			sections_title: "eval src evidenc",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "76495",
			sections_year: 1900,
			sections_title: "reas & dec-mking",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "21801",
			sections_year: 1900,
			sections_title: "meas in practice",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "71604",
			sections_year: 1900,
			sections_title: "meas in practice",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "76505",
			sections_year: 1900,
			sections_title: "dev rehab prog",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "76509",
			sections_year: 1900,
			sections_title: "rehab learning",
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "71600",
			sections_year: 1900,
			sections_title: "reas & dec-mking",
			sections_instructor: "",
			sections_fail: 1,
		},
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

const VeryComplexQuery = {
	input: {
		WHERE: {
			OR: [
				{AND: [{GT: {sections_fail: 96}}, {IS: {sections_instructor: "a*"}}]},
				{AND: [{LT: {sections_audit: 1}}, {IS: {sections_title: "*media 1*"}}]},
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
	output: [
		{
			sections_uuid: "11232",
			sections_year: 2012,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "beca, bryan",
			sections_fail: 0,
		},
		{
			sections_uuid: "11233",
			sections_year: 1900,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "28474",
			sections_year: 2009,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "bass, john;soules, matthew",
			sections_fail: 0,
		},
		{
			sections_uuid: "28475",
			sections_year: 1900,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "36811",
			sections_year: 2007,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "bass, john;lewis, martin",
			sections_fail: 0,
		},
		{
			sections_uuid: "36812",
			sections_year: 1900,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "59291",
			sections_year: 2011,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "bass, john",
			sections_fail: 0,
		},
		{
			sections_uuid: "59292",
			sections_year: 1900,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "65766",
			sections_year: 2008,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "65767",
			sections_year: 1900,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "77513",
			sections_year: 2013,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "bass, john",
			sections_fail: 0,
		},
		{
			sections_uuid: "77514",
			sections_year: 1900,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "",
			sections_fail: 0,
		},
		{
			sections_uuid: "10508",
			sections_year: 2010,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "beca, bryan",
			sections_fail: 1,
		},
		{
			sections_uuid: "10509",
			sections_year: 1900,
			sections_title: "design media 1",
			sections_audit: 0,
			sections_instructor: "",
			sections_fail: 1,
		},
	],
};

const InvalidKeyMCompOnSKey = {
	WHERE: {
		OR: [
			{AND: [{GT: {sections_avg: 96}}, {IS: {sections_dept: "math"}}]},
			{AND: [{EQ: {sections_avg: 97}}, {LT: {sections_id: 550}}]},
		],
	},
	OPTIONS: {COLUMNS: ["sections_dept", "sections_id", "sections_avg"], ORDER: "sections_avg"},
};

const InvalidKeySCompOnMKey = {
	WHERE: {
		OR: [
			{AND: [{GT: {sections_fail: 96}}, {IS: {sections_avg: 40}}]},
			{AND: [{LT: {sections_avg: 45}}, {IS: {sections_id: "*2*"}}]},
			{EQ: {sections_pass: 620}},
		],
	},
	OPTIONS: {COLUMNS: ["sections_dept", "sections_id", "sections_avg", "sections_pass"], ORDER: "sections_avg"},
};

const InvalidIdStringEmptyId = {
	WHERE: {AND: [{GT: {_avg: 99}}, {IS: {_dept: "**"}}]},
	OPTIONS: {COLUMNS: ["_dept", "_avg"], ORDER: "_avg"},
};

export {
	emptyQuery,
	simpleQuery,
	simpleQueryWithNoOrder,
	complexQuery,
	exceedLimitQuery,
	wildCardQueryA,
	wildCardQueryB,
	wildCardQueryC,
	wildCardQueryD,
	invalidStringQuery,
	invalidFormatQuery,
	invalidReferenceQuery,
	invalidEBNFType,
	invalidEBNFKey,
	invalidEBNFMissingWhere,
	invalidEBNFInvalidWhereType,
	invalidEBNFMissingOptions,
	invalidEBNFMissingColumns,
	invalidEBNFEmptyColumns,
	invalidEBNFInvalidColumnsType,
	invalidEBNFInvalidOrderType,
	invalidEBNFInvalidOrderKey,
	invalidEBNFFilterKey,
	invalidMultipleIDsQuery,
	LTOperatorQuery,
	NegationQuery,
	FilterWithNoOptionQuery,
	MoreComplexQuery,
	MoreComplexQueryReturn0,
	VeryComplexQuery,
	InvalidKeyMCompOnSKey,
	InvalidKeySCompOnMKey,
	InvalidIdStringEmptyId,
};
