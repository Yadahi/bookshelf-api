import request from "supertest";
import app from "../app.js";
import db from "../db.js";
import { beforeAll, expect } from "vitest";

let bookId;

beforeAll(() => {
  db.prepare("DELETE FROM books").run();
});

describe("Bookshelf API", () => {
  it("GET / should return welcome message", async () => {
    const response = await request(app).get("/");

    expect(response.body.message).toBe("Welcome to the Bookshelf API");
    expect(response.status).toBe(200);
  });
});

describe("POST / GET a book", () => {
  it("POST a book", async () => {
    const response = await request(app).post("/books/").send({
      title: "Dune",
      author: "Frank Herbert",
      genre: "Sci-Fi",
      year: 1965,
    });

    bookId = response.body.id;
    expect(response.status).toBe(201);
  });

  it("GET a book", async () => {
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
});

describe("DELETE a book", () => {
  it("should delete a book", async () => {
    const response = await request(app).delete(`/books/${bookId}`);

    expect(response.status).toBe(200);
  });

  it("should return 404 for non-existent book", async () => {
    const response = await request(app).delete("/books/-1").expect(404);

    expect(response.body.error).toBe("Book not found");
  });
});
