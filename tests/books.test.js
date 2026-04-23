import request from "supertest";
import app from "../app.js";
import db from "../db.js";
import { beforeAll, describe, expect } from "vitest";

let bookId;

beforeAll(() => {
  db.prepare("DELETE FROM books").run();
  db.prepare(
    "INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)",
  ).run("Another Title", "Another Author", "Fantasy", 2000);
});

describe("Bookshelf API", () => {
  it("GET / should return welcome message", async () => {
    const response = await request(app).get("/");

    expect(response.body.message).toBe("Welcome to the Bookshelf API");
    expect(response.status).toBe(200);
  });
});

describe("POST and GET /books", () => {
  // happy path
  it("should create a new book and return 201", async () => {
    const response = await request(app)
      .post("/books/")
      .send({
        title: "Dune",
        author: "Frank Herbert",
        genre: "Sci-Fi",
        year: 1965,
      })
      .set("Authorization", "Bearer my-secret-token-123");

    bookId = response.body.id;
    expect(response.status).toBe(201);
  });

  // error case
  it("should return 400 when title is missing", async () => {
    const response = await request(app)
      .post("/books/")
      .send({
        author: "New Author",
        genre: "Fantasy",
        year: 200,
      })
      .set("Authorization", "Bearer my-secret-token-123");

    expect(response.body.error).toBe("Title is required");
  });

  // happy path
  it("should return a book by id", async () => {
    const response = await request(app).get(`/books/${bookId}`);

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      id: bookId,
      title: "Dune",
      author: "Frank Herbert",
      genre: "Sci-Fi",
      year: 1965,
    });
  });

  it("should return 404 for non-existent book", async () => {
    const response = await request(app).get(`/books/-1`).expect(404);

    expect(response.body.error).toBe("Book not found");
  });
});

describe("GET /books with filters", () => {
  it("should return filtered book", async () => {
    const response = await request(app)
      .get("/books/")
      .query({ genre: "Sci-Fi" });

    expect(response.body.total).toBe(1);
    expect(response.body.data[0].genre).toBe("Sci-Fi");
  });
});

describe("PUT /books/:id", () => {
  // happy path
  it("should update a book and return updated data", async () => {
    const response = await request(app)
      .put(`/books/${bookId}`)
      .send({
        title: "Dune",
        author: "Frank Herbert",
        genre: "Sci-Fi",
        year: 1967,
      })
      .set("Authorization", "Bearer my-secret-token-123");

    expect(response.body).toStrictEqual({
      id: bookId,
      title: "Dune",
      author: "Frank Herbert",
      genre: "Sci-Fi",
      year: 1967,
    });
  });

  // error case
  it("should return 404 when book does not exist", async () => {
    const response = await request(app)
      .put(`/books/-1`)
      .send({
        id: bookId,
        title: "Dune",
        author: "Frank Herbert",
        genre: "Sci-Fi",
        year: 1967,
      })
      .set("Authorization", "Bearer my-secret-token-123")
      .expect(404);

    expect(response.body.error).toBe("Book not found");
  });
});

describe("DELETE /books/:id", () => {
  // happy path
  it("should delete a book and return 200", async () => {
    const response = await request(app)
      .delete(`/books/${bookId}`)
      .set("Authorization", "Bearer my-secret-token-123");

    expect(response.status).toBe(200);
  });

  // error case
  it("should return 404 when book does not exist", async () => {
    const response = await request(app)
      .delete("/books/-1")
      .set("Authorization", "Bearer my-secret-token-123")
      .expect(404);

    expect(response.body.error).toBe("Book not found");
  });
});
