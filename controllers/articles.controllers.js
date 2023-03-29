const { response } = require("../app");
const {
  fetchArticleById,
  fetchArticles,
} = require("../models/articles.models.js");

exports.getArticles = (request, response) => {
  fetchArticles().then((articles) => {
    response.status(200).send({ articles: articles });
  });
};

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
