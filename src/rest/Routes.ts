import {Application} from "express";
import InsightFacade from "../controller/InsightFacade";
import {InsightError, ResultTooLargeError} from "../controller/IInsightFacade";
import Controller from "./Controller";

export default class Routes {
	private app: Application;

	constructor(app: Application) {
		console.log("Initializing routes...");
		this.app = app;
	}

	// Registers all request handlers to routes
	public registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.app.get("/echo/:msg", Controller.echo);
		this.app.put("/dataset/:id/:kind", Controller.addDataset);
		this.app.delete("/dataset/:id", Controller.removeDataset);
		this.app.post("/query", Controller.performQuery);
		this.app.get("/datasets", Controller.listDataset);
	}
}
