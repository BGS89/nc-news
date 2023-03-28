const db = require("../db/connection.js");
const format = require("pg-format");

exports.fetchArticle = (articleId) => {
  return db
    .query(
      `SELECT * FROM articles
        WHERE article_id = $1;`,
      [articleId]
    )
    .then((results) => {
      if (!results.rows.length) {
        return Promise.reject({ Message: "ID not found", status: 404 });
      }
      return results.rows[0];
    });
};
