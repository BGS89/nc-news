const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers");
const { getArticleById } = require("./controllers/articles.controllers");

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ message: "Invalid input" });
  } else response.status(500).send({ message: "Internal serveeer error" });
});

app.use("/*", (request, response) => {
  response.status(404).send({ message: "Invalid path" });
});

module.exports = app;

// '22P02'
