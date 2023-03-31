const db = require("../db/connection.js");
const format = require("pg-format");

exports.removeComment = (commentId) => {
  return db
    .query(
      `
  DELETE FROM comments 
  WHERE comment_id = $1
  RETURNING *;`,
      [commentId]
    )
    .then((results) => {
      console.log(results.rows[0]);
      if (!results.rows.length) {
        return Promise.reject({ message: "ID not found", status: 404 });
      }
    });
};
