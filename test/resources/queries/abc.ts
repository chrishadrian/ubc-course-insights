export const veryComplexQuery = {
	input: {
		WHERE: {
			OR: [
				{
					AND: [
						{
							GT: {
								sections_fail: 96,
							},
						},
						{
							IS: {
								sections_instructor: "a*",
							},
						},
					],
				},
				{
					AND: [
						{
							LT: {
								sections_audit: 1,
							},
						},
						{
							IS: {
								sections_title: "*media 1*",
							},
						},
					],
				},
				{
					AND: [
						{
							EQ: {
								sections_year: 2023,
							},
						},
						{
							IS: {
								sections_uuid: "*123*",
							},
						},
					],
				},
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
			ORDER: "sections_uuid",
		},
	},
	expected: [
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
	],
};
