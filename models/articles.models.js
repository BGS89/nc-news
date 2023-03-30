const db = require("../db/connection.js");
const format = require("pg-format");

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY created_at DESC
`
    )
    .then((results) => {
      return results.rows;
    });
};

exports.fetchArticleById = (articleId) => {
  return db
    .query(
      `SELECT * FROM articles
        WHERE article_id = $1;`,
      [articleId]
    )
    .then((results) => {
      if (!results.rows.length) {
        return Promise.reject({ message: "ID not found", status: 404 });
      }
      return results.rows[0];
    });
};

exports.checkArticleExists = (articleId) => {
  return db
    .query(
      `SELECT * FROM articles
        WHERE article_id = $1;`,
      [articleId]
    )
    .then((results) => {
      if (!results.rows.length) {
        return Promise.reject({ message: "ID not found", status: 404 });
      }
    });
};

exports.fetchArticleComments = (articleId) => {
  return db
    .query(
      `SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;`,
      [articleId]
    )
    .then((results) => {
      return results.rows;
    });
};

exports.addComment = (comment, articleId) => {
  const { username, body } = comment;

  return db
    .query(
      `INSERT INTO comments
    (author, body, article_id)
    VALUES
    ($1, $2, $3)
    RETURNING *;`,
      [username, body, articleId]
    )
    .then((postedComment) => {
      return postedComment.rows[0];
    });
};
