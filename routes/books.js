const express = require("express");
const db = require("../db");

const router = express.Router();

// ==================== CRUD OPERATIONS ====================
// Create = POST | Read = GET | Update = PUT/PATCH | Delete = DELETE

// CREATE - POST /books
// Data comes in req.body (parsed by express.json middleware)
// Client sends JSON like: { "title": "The Hobbit", "author": "Tolkien", ... }
router.post("/", (req, res) => {
  const { title, author, genre, year } = req.body; // Destructure fields from request body
  // db.prepare() = get the SQL ready with ? placeholders (prevents SQL injection!)
  // NEVER put values directly in the SQL string
  const stmt = db.prepare(
    "INSERT INTO books (title, author, genre, year) VALUES (?, ?, ?, ?)",
  );
  // .run() = execute INSERT/UPDATE/DELETE (queries that CHANGE data)
  // Returns metadata: { lastInsertRowid, changes }
  const result = stmt.run(title, author, genre, year);
  // 201 = "Created" status code. Send back the new book with its auto-generated id.
  res
    .status(201)
    .json({ id: result.lastInsertRowid, title, author, genre, year });
});

// READ ALL - GET /books
router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM books");
  // .all() = execute SELECT, return ALL rows as an array of objects
  // Empty table returns [], not undefined
  const result = stmt.all();
  // 200 is the default status, no need to write .status(200)
  res.json(result);
});

// READ ONE - GET /books/:id
// :id is a route parameter - a placeholder in the URL
// /books/5 → req.params.id = "5" (always a string!)
// No middleware needed for params - Express extracts them automatically
router.get("/:id", (req, res) => {
  const stmt = db.prepare("SELECT * FROM books WHERE id=?");
  // .get() = execute SELECT, return ONE row as an object (or undefined if not found)
  const result = stmt.get(req.params.id);
  // Always check if the resource exists before sending it
  if (!result) {
    res.status(404).json({ error: "Book not found" }); // 404 = "Not Found"
    return; // IMPORTANT: stop here so res.json below doesn't also run
  }
  res.json(result);
});

// UPDATE - PUT /books/:id
// PUT = replace entire resource (send ALL fields)
// PATCH = partial update (send only changed fields) - trickier to implement
// ID comes from URL (req.params), new data comes from body (req.body)
router.put("/:id", (req, res) => {
  const { title, author, genre, year } = req.body;
  const stmt = db.prepare(
    "UPDATE books SET title=?, author=?, genre=?, year=? WHERE id=?",
  );
  const result = stmt.run(title, author, genre, year, req.params.id);
  // .run() ALWAYS returns an object (never undefined)
  // result.changes = number of rows affected. 0 means book doesn't exist.
  if (result.changes === 0) {
    res.status(404).json({ error: "Book not found" });
    return;
  }
  // Send back the updated book (NOT result - that's just metadata like { changes: 1 })
  // Number() because req.params.id is a string from the URL
  res.json({ id: Number(req.params.id), title, author, genre, year });
});

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
