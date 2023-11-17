import express, {Application} from "express";
import cors from "cors";

export default class Middleware {
	private app: Application;
	constructor(app: Application) {
		console.log("Initializing middleware...");
		this.app = app;
	}

	// Registers middleware to parse request before passing them to request handlers
	public registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.app.use(express.json());
		this.app.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.app.use(cors());
	}
}
