const { response, request } = require("../app");
const {
  fetchArticleById,
  fetchArticles,
  fetchArticleComments,
  checkArticleExists,
  addComment,
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

exports.getArticleComments = (request, response, next) => {
  const { article_id } = request.params;

  checkArticleExists(article_id)
    .then(() => {
      return fetchArticleComments(article_id);
    })
    .then((comments) => {
      if (!comments.length) {
        response.status(200).send({ comments: [] });
      } else {
        response.status(200).send({ comments });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticleComment = (request, response, next) => {
  const { article_id } = request.params;
  const commentToPost = request.body;

  checkArticleExists(article_id)
    .then(() => {
      return addComment(commentToPost, article_id);
    })
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};
