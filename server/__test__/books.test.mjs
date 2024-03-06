import request from "supertest";
// require("dotenv").config();
import mongoose from "mongoose";
import app from "../server";

beforeEach(async () => {
  await mongoose.connect(process.env.ATLAS_URI);
});

afterEach(async () => {
  await mongoose.connection.close();
});

let testId;

describe("adds a new book", () => {
  it("should return 200", async () => {
    const response = await request(app)
      .post("/books")
      .send({
        "title":"Redwall",
        "author":"Brian Jacques",
        "publicationYear": 1986
      });
    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
    testId = JSON.parse(response.text).insertedId;
  });

  it("should return 422 due to missing a field", async () => {
    const response = await request(app)
      .post("/books")
      .send({
        "title":"Dune",
        "publicationYear": 1965
      });
    expect(response.status).toBe(422);
  });
});

describe("get all books", () => {
  it("should return 200 and all books", async () => {
    const response = await request(app)
      .get("/books")
      .set("content-type", "application/json");
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeTruthy();
  });
});

describe("get a specific book", () => {
  it("should return 200 with that book", async () => {
    const response = await request(app)
      .get(`/books/${testId}`)
      .set("content-type", "application/json");
    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
  });

  it("should return Not found due to id not existing", async () => {
    const response = await request(app)
      .get("/books/05e2ac2514c82863c629b3e1")
      .set("content-type", "application/json");
    expect(response.text).toBe("Not found");
  });
});

describe("search books by title or author", () => {
  it("should return 200 with those books", async () => {
    const response = await request(app)
      .get("/books/search/?title=Redwall")
      .set("content-type", "application/json");
    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
  });

  it("should return Not found due to id not existing", async () => {
    const response = await request(app)
      .get("/books/search/?title=Book of Many Things")
      .set("content-type", "application/json");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Not found");
  });
});

describe("updates a book", () => {
  it("should return 200 and update the book information", async () => {
    const response = await request(app)
      .put(`/books/${testId}`)
      .send({
        "publicationYear": "1969"
      });
    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
  });

  it("should return Not found due to id not existing", async () => {
    const response = await request(app)
      .put("/books/05e2ad2514c82863c629b3e1")
      .send({
        "publicationYear": "1234"
      });
    expect(response.status).toBe(200);
  });

  it("should return Invalid year due to invalid year input", async () => {
    const response = await request(app)
      .put(`/books/${testId}`)
      .send({
        "publicationYear": "Library of Leng"
      });
    expect(JSON.parse(response.text).yearErr).toBe("Invalid year");
  });
});

describe("delete a book", () => {
  it("should return 200 to confirm deletion", async () => {
    const response = await request(app)
      .delete(`/books/${testId}`)
    expect(response.status).toBe(200);
  });

  it("should return Not found due to confirm id was deleted", async () => {
    const response = await request(app)
      .get(`/books/${testId}`)
      .set("content-type", "application/json");
    expect(response.text).toBe("Not found");
  });
});