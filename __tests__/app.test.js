const app = require("../app.js");
const request = require("supertest");
const connection = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const { response } = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => connection.end());

describe("default error", () => {
  test("STATUS 404: responds with an error message when given incorrect path ", () => {
    return request(app)
      .get("/api/wrongpath")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Invalid path");
      });
  });
});

describe("/api/topics", () => {
  test("GET 200: responds with an array of topic objects each containing the properties slug & description ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
});

describe("/api/articles", () => {
  test("GET 200: responds with an array of article objects with the correct properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeInstanceOf(Array);
        expect(articles).toHaveLength(12);
        expect(articles[0]).toHaveProperty("comment_count", "2");
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  test("GET 200: responds with an array of article objects sorted by date in descending order ", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        const sortedArticles = [...articles].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        expect(articles).toEqual(sortedArticles);
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET 200: responds with an article object whith the correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("Status 400: responds with an error message when passed a bad article ID", () => {
    return request(app)
      .get("/api/articles/notAnID")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid input");
      });
  });
  test("Status 404: responds with an error message when passed an unknown article ID", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("ID not found");
      });
  });
  test("PATCH 200: returns an article with vote count updated when passed a postive inc_votes number", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 10 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 110,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH 200: returns an article with vote count updated when passed a negative in_votes number", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -10 })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: expect.any(Number),
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 90,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("PATCH 200: add a comment to given article comments ignoring extra keys in input body", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 5, randomKey: "What am i doing here?" })
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          article_id: expect.any(Number),
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 105,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("Status 400: responds with an error message when missing required input information", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        not_votes: "These are not votes",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Missing required information");
      });
  });
  test("Status 400: responds with an error message when passed invalid data type", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({
        inc_votes: "These are not votes",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid input");
      });
  });
  test("Status 404: responds with an error message when passed an unknown article ID", () => {
    return request(app)
      .patch("/api/articles/999")
      .send({ inc_votes: 20 })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("ID not found");
      });
  });
  test("Status 400: responds with an error message when passed a bad article ID", () => {
    return request(app)
      .patch("/api/articles/notAnID")
      .send({ inc_votes: 1 })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid input");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET 200: responds with an array of comments for the given article_id with the correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
  test("GET 200: responds with an array of comments with most recent comments first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        const sortedComments = [...comments].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        expect(comments).toEqual(sortedComments);
      });
  });
  test("Status 400: responds with an error message when passed a bad article ID", () => {
    return request(app)
      .get("/api/articles/notAnID/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid input");
      });
  });
  test("Get 200: responds with empty array when article_id is valid but no comments found ", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeInstanceOf(Array);
        expect(comments).toHaveLength(0);
      });
  });
  test("Status 404: responds with an error message when passed an unknown article ID", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("ID not found");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("POST 201: add a comment to given article comments and respond with newly created comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "icellusedkars",
        body: "Am I the batman?",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: "Am I the batman?",
          article_id: 1,
          author: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("POST 201: add a comment to given article comments ignoring extra keys in input body", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "icellusedkars",
        body: "too many keys",
        rankdomKey: 12,
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toMatchObject({
          comment_id: expect.any(Number),
          body: "too many keys",
          article_id: 1,
          author: expect.any(String),
          votes: expect.any(Number),
          created_at: expect.any(String),
        });
      });
  });
  test("Status 400: reposnds with an error message when missing required information", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "icellusedkars",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Missing required information");
      });
  });
  test("Status 404: reposnds with an error message when given wrong username information", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "user1234",
        body: "username here is wrong",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Username not found");
      });
  });
  test("Status 404: responds with an error message when passed an unknown article ID", () => {
    return request(app)
      .post("/api/articles/999999/comments")
      .send({
        username: "icellusedkars",
        body: "Am I the batman?",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("ID not found");
      });
  });
  test("Status 400: responds with an error message when passed a bad article ID", () => {
    return request(app)
      .post("/api/articles/notAnID/comments")
      .send({
        username: "icellusedkars",
        body: "Am I the batman?",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid input");
      });
  });
});

describe("/api/comments/:comment_id", () => {
  test("DELETE 204: should delete comment with given comment_id ", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("Status 404: passed a comment_id that does not exist", () => {
    return request(app)
      .delete("/api/comments/5000000000")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Comment not found");
      });
  });
  test("Staus 400: passed a bad comment_id ", () => {
    return request(app)
      .delete("/api/comments/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid input");
      });
  });
});
