import request from "supertest";
import app from "../app.js";

describe("Bookshelf API", () => {
  it("GET / should return welcome message", async () => {
    const response = await request(app).get("/");

    expect(response.body.message).toBe("Welcome to the Bookshelf API");
    expect(response.status).toBe(200);
  });
});

describe("POST / GET a book", () => {
  let bookId;
  it("POST a book", async () => {
    const response = await request(app).post("/books/").send({
      title: "Dune",
      author: "Frank Herbert",
      genre: "Sci-Fi",
      year: 1965,
    });

    bookId = response.body.id;
    console.log(bookId);

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
