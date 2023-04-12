const db = require("../db/connection.js");
const format = require("pg-format");

exports.fetchArticles = (topic, order, sortBy) => {
  if (order && order !== "asc" && order !== "desc") {
    return Promise.reject({ message: "Invalid order query", status: 400 });
  }

  if (!topic && !sortBy) {
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
  }

  const queryValues = [];
  let queryStr = "SELECT * FROM articles ";

  if (topic) {
    queryValues.push(topic);
    queryStr += `WHERE topic = $1`;
  }

  if (order) {
    queryStr += `ORDER BY created_at ${order.toUperCase()}`;
  }

  if (sortBy) {
    const columns = [
      "article_id",
      "title",
      "topic",
      "author",
      "created_at",
      "votes",
    ];
    if (columns.includes(sortBy)) {
      queryValues.push(sortBy);
      queryStr += `ORDER BY $1 `;
    } else {
      return Promise.reject({ message: "Invalid sort query", status: 400 });
    }
  }

  return db.query(queryStr, queryValues).then((results) => {
    if (!results.rows.length) {
      return Promise.reject({ message: "Topic does not exist", status: 404 });
    }
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

exports.updateVotes = (votes, articleId) => {
  const { inc_votes } = votes;

  return db
    .query(
      `
    UPDATE articles 
    SET votes = votes + $1 
    WHERE article_id = $2
    RETURNING *;`,
      [inc_votes, articleId]
    )
    .then((updatedArticle) => {
      if (!updatedArticle.rows.length) {
        return Promise.reject({ message: "ID not found", status: 404 });
      }
      return updatedArticle.rows[0];
    });
};
