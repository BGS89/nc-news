const db = require("../db/connection.js");

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users;`).then((results) => {
    return results.rows;
  });
};
