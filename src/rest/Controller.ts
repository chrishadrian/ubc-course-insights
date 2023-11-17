import {Application, Request, Response} from "express";
import InsightFacade from "../controller/InsightFacade";
import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import Usecase from "./Usecase";

export default class Controller {
	constructor() {
		console.log("Initializing controller...");
	}

	// The next two methods handle the echo service.
	public static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Usecase.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	// TODO: POST /dataset/:id/:kind allows one to submit a zip file that will be parsed and used for future queries. The zip file content will be sent 'raw' as a buffer in the PUT's body, and you will need to convert it to base64 server side.
	public static async addDataset(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const result = await facade.addDataset(req.params.id, req.params.kind, req.body);
			res.status(200).json({result});
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400).json({error: error.message});
			} else {
				res.status(500).json({error: error});
			}
		}
	}

	// TODO: DELETE /dataset/:id deletes the existing dataset stored. This will delete both disk and memory caches for the dataset for the id, meaning that subsequent queries for that id should fail unless a new PUT happens first.
	public static async removeDataset(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const result = await facade.removeDataset(req.params.id);
			res.status(200).json({result});
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400).json({error: error.message});
			} else if (error instanceof ResultTooLargeError) {
				res.status(404).json({error: error.message});
			}
		}
	}

	// TODO: POST /query sends the query to the application. The query will be in JSON format in the POST's body.
	// NOTE: the server may be shutdown between the PUT and the POST. This endpoint should always check for a persisted data structure on disk before returning a missing dataset error.
	public static async performQuery(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const result = await facade.performQuery(req.body);
			res.status(200).json({result});
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400).json({error: error.message});
			} else {
				res.status(500).json({error: error});
			}
		}
	}

	// TODO: GET /datasets returns a list of datasets that were added.
	public static async listDataset(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const result = await facade.listDatasets();
			res.status(200).json({result});
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400).json({error: error.message});
			} else {
				res.status(500).json({error: error});
			}
		}
	}
}
