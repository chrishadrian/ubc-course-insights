import {Request, Response} from "express";
import InsightFacade from "../../controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError, ResultTooLargeError} from "../../controller/IInsightFacade";

export default class DatasetController {
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
			res.status(200).json({result: result});
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

	public static async removeDataset(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const result = await facade.removeDataset(req.params.id);
			res.status(200).json({result: result});
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400).json({error: error.message});
			} else if (error instanceof NotFoundError) {
				res.status(404).json({error: error.message});
			} else {
				res.status(500).json({error: error});
			}
		}
	}

	public static async performQuery(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const result = await facade.performQuery(req.body);
			res.status(200).json({result: result});
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

	public static async listDataset(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const result = await facade.listDatasets();
			res.status(200).json({result: result});
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400).json({error: error.message});
			} else {
				res.status(500).json({error: error});
			}
		}
	}
}
