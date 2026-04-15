const express = require("express");
const app = express();
const port = 3000;
const Database = require("better-sqlite3");

// Initialize database
const db = new Database("bookshelf.db", { verbose: console.log });

// Create table
db.exec(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT,
    year INTEGER
)`);

app.use(express.json());

// app.use((req, res, next) => {
//   console.log("req", req);
//   next();
// });

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Bookshelf API" });
});

app.post("/books", (req, res) => {
  const { title, author, genre, year } = req.body;
  const stmt = db.prepare(
    "INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)",
  );
  const result = stmt.run(title, author, genre, year);
  res
    .status(201)
    .json({ id: result.lastInsertRowid, title, author, genre, year });
});

app.get("/books", (req, res) => {
  const stmt = db.prepare("SELECT * FROM books");
  const result = stmt.all();
  res.json(result);
});

app.get("/books/:id", (req, res) => {
  const stmt = db.prepare("SELECT * FROM books WHERE id=?");
  const result = stmt.get(req.params.id);
  if (!result) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(result);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
