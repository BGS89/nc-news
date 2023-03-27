const express = require("express");
const app = express();
const { getTopics } = require("../be-nc-news/controllers/topics.controllers");

app.get("/api/topics", getTopics);

app.use("/*", (request, response) => {
  response.status(404).send({ message: "Invalid path" });
});

module.exports = app;
