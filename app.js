const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers");
const {
  getArticles,
  getArticleById,
  getArticleComments,
  postArticleComment,
} = require("./controllers/articles.controllers");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.post("/api/articles/:article_id/comments", postArticleComment);

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ message: "Invalid input" });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  if (err.code === "23502") {
    response.status(400).send({ message: "Missing required information" });
  } else {
    next(err);
  }
});

app.use((err, request, response, next) => {
  const { status, message } = err;
  if (status && message) {
    response.status(status).send({ message });
  } else {
    next(err);
  }
});

app.use("/*", (request, response) => {
  response.status(404).send({ message: "Invalid path" });
});

module.exports = app;
