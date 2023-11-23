import {Application} from "express";
import InsightFacade from "../controller/InsightFacade";
import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import DatasetController from "./controllers/DatasetController";
import CourseController from "./controllers/CourseController";

export default class Routes {
	private app: Application;

	constructor(app: Application) {
		console.log("Initializing routes...");
		this.app = app;
	}

	public registerRoutes() {
		this.app.get("/datasets", DatasetController.listDataset);
		this.app.put("/dataset/:id/:kind", DatasetController.addDataset);
		this.app.delete("/dataset/:id", DatasetController.removeDataset);
		this.app.post("/query", DatasetController.performQuery);

		this.app.get("/course/subjects", CourseController.getCourseSubjects);
		this.app.get("/course/:subject/numbers", CourseController.getCourseNumbersBySubject);
		this.app.get("/course/:subject/:number/:statistics", CourseController.getCourseStatistics);

		this.app.get("/professor/subjects", CourseController.getCourseSubjects);
		this.app.get("/professor/:subject/numbers", CourseController.getCourseNumbersBySubject);
		this.app.get("/professor/:subject/:number/:year", CourseController.getBestProfs);

	}
}
