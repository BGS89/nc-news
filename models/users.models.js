const db = require("../db/connection.js");
const format = require("pg-format");

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users;`).then((results) => {
    return results.rows;
  });
};
