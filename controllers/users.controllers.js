const { response } = require("../app");
const { fetchUsers } = require("../models/users.models");

exports.getUsers = (request, response) => {
  fetchUsers().then((users) => {
    response.status(200).send({ users: users });
  });
};
