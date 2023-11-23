import {Request, Response} from "express";
import InsightFacade from "../../controller/InsightFacade";
import {InsightError} from "../../controller/IInsightFacade";
import {filterCourseProfs} from "./constants";

export default class ProfController {
	public static async getBestProfs(req: Request, res: Response) {
		try {
			const courseSubject = req.params.subject.toLowerCase();
			const courseNumber = req.params.number.toLowerCase();
			const year = Number(req.params.year);
			const query = filterCourseProfs(courseSubject, courseNumber, year);
			const facade = new InsightFacade();
			const result = await facade.performQuery(query);
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
