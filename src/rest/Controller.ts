import {Application, Request, Response} from "express";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError, ResultTooLargeError} from "../controller/IInsightFacade";
import Usecase from "./Usecase";

export default class Controller {
	// This method handles the echo service.
	public static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Usecase.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400).json({error: error.message});
			} else {
				res.status(500).json({error: error});
			}
		}
	}

	// TODO: POST /dataset/:id/:kind allows one to submit a zip file that will be parsed and used for future queries. The zip file content will be sent 'raw' as a buffer in the POST's body, and you will need to convert it to base64 server side.
	public static async addDataset(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const inputs: {
				id: string;
				content: string;
				kind: InsightDatasetKind;
			} = {
				id: req.params.id,
				content: req.body.toString("base64"),
				kind: req.params.kind as InsightDatasetKind,
			};
			const result = await facade.addDataset(inputs.id, inputs.content, inputs.kind);
			res.status(200).json({result});
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400).json({error: error.message});
			} else if (error instanceof NotFoundError) {
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
			} else if (error instanceof NotFoundError) {
				res.status(400).json({error: error.message});
			} else {
				res.status(500).json({error: error});
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
			} else if (error instanceof ResultTooLargeError) {
				res.status(404).json({error: error.message});
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
