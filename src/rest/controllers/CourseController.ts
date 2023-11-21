import {Request, Response} from "express";
import InsightFacade from "../../controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError, ResultTooLargeError} from "../../controller/IInsightFacade";
import {filterCourseNumQuery, filterCourseSubjectQuery} from "./constants";
import * as fs from "fs-extra";


export default class CourseController {
	public static async getCourseSubjects(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const result = await facade.performQuery(filterCourseSubjectQuery);
			if (!fs.existsSync("frontend/src/data/courses.json")) {
				await fs.writeFile("frontend/src/data/courses.json", JSON.stringify(result));
			}
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

	public static async getCourseSectionsBySubject(req: Request, res: Response) {
		try {
			const facade = new InsightFacade();
			const courseSubject = req.params.subject.toLowerCase();
			const query = filterCourseNumQuery(courseSubject);
			const result = await facade.performQuery(query);
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
}
