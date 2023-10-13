export const veryComplexQuery = {
	input: {
		WHERE: {
			GT: {
				sections_audit: 15,
			},
		},
		OPTIONS: {
			COLUMNS: [
				"sections_uuid",
				"sections_year",
				"sections_title",
				"sections_instructor",
				"sections_fail",
				"sections_audit",
			],
			ORDER: "sections_uuid",
		},
	},
	expected: [
		{
			sections_uuid: "21789",
			sections_year: 1900,
			sections_title: "eval src evidenc",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 23,
		},
		{
			sections_uuid: "21801",
			sections_year: 1900,
			sections_title: "meas in practice",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 18,
		},
		{
			sections_uuid: "62474",
			sections_year: 2015,
			sections_title: "machine learn i",
			sections_instructor: "schmidt, mark",
			sections_fail: 0,
			sections_audit: 18,
		},
		{
			sections_uuid: "62475",
			sections_year: 1900,
			sections_title: "machine learn i",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 21,
		},
		{
			sections_uuid: "71600",
			sections_year: 1900,
			sections_title: "reas & dec-mking",
			sections_instructor: "",
			sections_fail: 1,
			sections_audit: 19,
		},
		{
			sections_uuid: "71604",
			sections_year: 1900,
			sections_title: "meas in practice",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 19,
		},
		{
			sections_uuid: "76489",
			sections_year: 1900,
			sections_title: "eval src evidenc",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 21,
		},
		{
			sections_uuid: "76495",
			sections_year: 1900,
			sections_title: "reas & dec-mking",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 19,
		},
		{
			sections_uuid: "76505",
			sections_year: 1900,
			sections_title: "dev rehab prog",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 20,
		},
		{
			sections_uuid: "76509",
			sections_year: 1900,
			sections_title: "rehab learning",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 17,
		},
		{
			sections_uuid: "97727",
			sections_year: 2013,
			sections_title: "mult regres meth",
			sections_instructor: "lemay, valerie;tait, david e n",
			sections_fail: 0,
			sections_audit: 19,
		},
		{
			sections_uuid: "97728",
			sections_year: 1900,
			sections_title: "mult regres meth",
			sections_instructor: "",
			sections_fail: 0,
			sections_audit: 19,
		},
	],
};
