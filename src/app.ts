import express from "express";

const app = express();

app.get("/", function (_req, res) {
  return res.send("Parkour bot Up and running");
});

export default app;
