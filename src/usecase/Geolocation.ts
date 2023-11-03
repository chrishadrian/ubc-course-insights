import * as http from "http";

interface GeoResponse {
	lat?: number;
	lon?: number;
	error?: string;
}

export default class Geolocation {
	public getGeolocation = (address?: string): Promise<GeoResponse> => {
		return new Promise<GeoResponse>((resolve, reject) => {
			if (!address) {
				return Promise.reject({error: "Error: address is undefined!"});
			}
			const encodedAddress = encodeURIComponent(address);
			const url = `http://cs310.students.cs.ubc.ca:11316/api/v1/project_team246/${encodedAddress}`;

			http
				.get(url, (response) => {
					let data = "";

					// A chunk of data has been received.
					response.on("data", (chunk) => {
						data += chunk;
					});

					// The whole response has been received.
					response.on("end", () => {
						try {
							const parsedData: GeoResponse = JSON.parse(data);
							resolve(parsedData);
						} catch (error) {
							reject({error: "Failed to parse response data"});
						}
					});
				})
				.on("error", (error) => {
					reject({error: `Error: ${error.message}`});
				});
		});
	};
}
