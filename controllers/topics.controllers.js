const { response } = require("../app");
const { fetchTopics } = require("../models/topics.models.js");

exports.getTopics = (request, response) => {
  fetchTopics().then((topics) => {
    response.status(200).send({ topics: topics.rows });
  });
};
