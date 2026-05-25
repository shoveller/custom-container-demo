import express from "express";

const app = express();

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.get("/", (_req, res) => {
    res.send("hello from Cloudflare container");
});

app.listen(3000, "0.0.0.0", () => {
    console.log("listening on :3000");
});