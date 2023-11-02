const roomQuery = {
	title: "Room Transformation Query With Group and Count",
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
				"countSeats"
			]
		},
		TRANSFORMATIONS: {
			GROUP: [
				"rooms_type"
			],
			APPLY: [
				{
					countSeats: {
						COUNT: "rooms_seats"
					}
				}
			]
		}
	},
	errorExpected: false,
	expected: [
		{
			rooms_type: "Tiered Large Group",
			countSeats: 2
		},
		{
			rooms_type: "Open Design General Purpose",
			countSeats: 1
		}
	]
};

export {roomQuery};
