const { response } = require("../app");
const { fetchArticle } = require("../models/articles.models.js");

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticle(article_id)
    .then((article) => {
      console.log({ article });
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
