const roomQuery = {
	title: "Transformation Query With Group and Avg",
	input: {
		WHERE: {
			AND: [
				{
					IS: {
						rooms_furniture: "*Tables*"
					}
				},
				{
					GT: {
						rooms_seats: 300
					}
				}
			]
		},
		OPTIONS: {
			COLUMNS: [
				"rooms_type",
				"avgSeats"
			]
		},
		TRANSFORMATIONS: {
			GROUP: [
				"rooms_type"
			],
			APPLY: [
				{
					avgSeats: {
						AVG: "rooms_seats"
					}
				}
			]
		}
	},
	errorExpected: false,
	expected: [
		{
			rooms_type: "Tiered Large Group",
			avgSeats: 358.33
		},
		{
			rooms_type: "Open Design General Purpose",
			avgSeats: 442
		}
	]
};

export {roomQuery};
