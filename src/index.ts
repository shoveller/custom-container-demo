import { Container, getContainer, getRandom } from "@cloudflare/containers";
import { Hono } from "hono";
import type { Context } from "hono";

const CONTAINER_POOL_SIZE = 1;

export class MyContainer extends Container<Env> {
	// Port the container listens on
	defaultPort = 3000;
	// Time before container sleeps due to inactivity (default: 30s)
	sleepAfter = "2m";
	// Environment variables passed to the container
	envVars = {
		MESSAGE: "I was passed in via the container class!",
	};

	// Optional lifecycle hooks
	override onStart() {
		console.log("Container successfully started");
	}

	override onStop() {
		console.log("Container successfully shut down");
	}

	override onError(error: unknown) {
		console.log("Container error:", error);
	}
}

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
	Bindings: Env;
}>();

// Home route with available endpoints
app.get("/_gateway/health", (c) => {
	return c.json({ ok: true, poolSize: CONTAINER_POOL_SIZE });
});

type AppContext = Context<{ Bindings: Env }>;

// Proxy public traffic to the container pool without exposing container IDs.
app.all("*", async (c: AppContext) => {
	const container = await getRandom(c.env.MY_CONTAINER, CONTAINER_POOL_SIZE);

	return container.fetch(c.req.raw);
})

export default app;
