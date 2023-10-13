const exceedLimitQuery = {
	WHERE: {GT: {large_avg: 87}},
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
	WHERE: {
		AND: [{GT: {_avg: 99}}, {IS: {_dept: "**"}}],
	},
	OPTIONS: {
		COLUMNS: ["_dept", "_avg"],
		ORDER: "_avg",
	},
};

export {
	exceedLimitQuery,
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
	InvalidKeyMCompOnSKey,
	InvalidKeySCompOnMKey,
	InvalidIdStringEmptyId,
};
