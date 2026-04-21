const express = require("express");
const db = require("../db");

const router = express.Router();

function validateBook(title, author, year) {
  // Validation
  if (!title || !title.trim()) {
    return "Title is required";
  }

  if (!author || !author.trim()) {
    return "Author is required";
  }

  if (
    year !== undefined &&
    (typeof year !== "number" || year < 0 || year > 3000)
  ) {
    return "Year must be a number between 0 and 3000";
  }

  return null;
}

// ==================== CRUD OPERATIONS ====================
// Create = POST | Read = GET | Update = PUT/PATCH | Delete = DELETE

// === CREATE - POST /books ===
// Data comes in req.body (parsed by express.json middleware)
// Client sends JSON like: { "title": "The Hobbit", "author": "Tolkien", ... }
router.post("/", (req, res) => {
  const { title, author, genre, year } = req.body; // Destructure fields from request body

  const error = validateBook(title, author, year);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const cleanTitle = title.trim();
  const cleanAuthor = author.trim();
  const cleanGenre = genre ? genre.trim() : genre;

  // db.prepare() = get the SQL ready with ? placeholders (prevents SQL injection!)
  // NEVER put values directly in the SQL string
  const stmt = db.prepare(
    "INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)",
  );
  // .run() = execute INSERT/UPDATE/DELETE (queries that CHANGE data)
  // Returns metadata: { lastInsertRowid, changes }
  const result = stmt.run(cleanTitle, cleanAuthor, cleanGenre, year);
  // 201 = "Created" status code. Send back the new book with its auto-generated id.
  res.status(201).json({
    id: result.lastInsertRowid,
    title: cleanTitle,
    author: cleanAuthor,
    genre: cleanGenre,
    year,
  });
});

// === - GET /books ===
router.get("/", (req, res) => {
  const { title, author, genre, year, sort, order } = req.query;
  const allowedSortFields = ["title", "author", "genre", "year"];
  let sql = "SELECT * FROM books";

  const conditions = [];
  const values = [];

  if (title) {
    conditions.push("title=?");
    values.push(title);
  }

  if (author) {
    conditions.push("author=?");
    values.push(author);
  }

  if (genre) {
    conditions.push("genre=?");
    values.push(genre);
  }

  if (year) {
    conditions.push("year=?");
    values.push(year);
  }

  // Filtering
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  // Sorting
  if (sort && allowedSortFields.includes(sort)) {
    sql += " ORDER BY " + sort;
    if (order === "desc") {
      sql += " DESC";
    }
  }

  const stmt = db.prepare(sql);
  // .all() = execute SELECT, return ALL rows as an array of objects

  const result = stmt.all(...values);
  // 200 is the default status, no need to write .status(200)
  res.json(result);
});

// === READ ONE - GET /books/:id ===
// :id is a route parameter - a placeholder in the URL
// /books/5 → req.params.id = "5" (always a string!)
// No middleware needed for params - Express extracts them automatically
router.get("/:id", (req, res) => {
  const stmt = db.prepare("SELECT * FROM books WHERE id=?");
  // .get() = execute SELECT, return ONE row as an object (or undefined if not found)
  const result = stmt.get(req.params.id);
  // Always check if the resource exists before sending it
  if (!result) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  res.json(result);
});

// === UPDATE - PUT /books/:id ===
// PUT = replace entire resource (send ALL fields)
// PATCH = partial update (send only changed fields) - trickier to implement
// ID comes from URL (req.params), new data comes from body (req.body)
router.put("/:id", (req, res) => {
  const { title, author, genre, year } = req.body;

  const error = validateBook(title, author, year);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const cleanTitle = title.trim();
  const cleanAuthor = author.trim();
  const cleanGenre = genre ? genre.trim() : genre;

  const stmt = db.prepare(
    "UPDATE books SET title=?, author=?, genre=?, year=? WHERE id=?",
  );
  const result = stmt.run(
    cleanTitle,
    cleanAuthor,
    cleanGenre,
    year,
    req.params.id,
  );
  // .run() ALWAYS returns an object (never undefined)
  // result.changes = number of rows affected. 0 means book doesn't exist.
  if (result.changes === 0) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  // Send back the updated book (NOT result - that's just metadata like { changes: 1 })
  // Number() because req.params.id is a string from the URL
  res.json({
    id: Number(req.params.id),
    title: cleanTitle,
    author: cleanAuthor,
    genre: cleanGenre,
    year,
  });
});

// === DELETE ===
router.delete("/:id", (req, res) => {
  const stmt = db.prepare("DELETE FROM books WHERE id=?");
  const result = stmt.run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Book not found" }); // 404 = "Not Found"
    return; // IMPORTANT: stop here so res.json below doesn't also run
  }
  res.json({ message: "Book deleted" });
});

module.exports = router;
