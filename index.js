const express = require("express"); // Import express (CommonJS style - using require because "type": "commonjs" in package.json)
const app = express(); // Create the app object - the heart of everything. All routes, middleware, config go through this.
const port = 3000; // Port = a "door" on your computer. Clients knock on this door to talk to your server.
const Database = require("better-sqlite3"); // better-sqlite3 is SYNCHRONOUS (unlike the "sqlite3" package which is async with callbacks)

// Initialize database - creates the file if it doesn't exist, connects to it if it does
// verbose: console.log prints every SQL query to terminal (remove later when it gets noisy)
const db = new Database("bookshelf.db", { verbose: console.log });

// Create table - runs on every server start, but IF NOT EXISTS prevents duplicates
// AUTOINCREMENT = SQLite assigns 1, 2, 3... automatically, never reuses deleted IDs
// (SQLite creates a sqlite_sequence table behind the scenes to track this)
db.exec(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT,
    year INTEGER
)`);

// Middleware: express.json() parses incoming JSON request bodies into req.body
// Without this, req.body is undefined. Express can SEND json (res.json) by default,
// but needs this middleware to READ incoming json.
// Middleware goes BEFORE routes that need it.
app.use(express.json());

// ==================== ROUTES ====================
// A route = HTTP method + path + handler function
// Handler receives: req (what the client sent) and res (how you respond)

// GET / - Welcome message
app.get("/", (req, res) => {
  // res.json() sends JSON and sets Content-Type header to application/json
  // res.send() is more generic - detects type (string = HTML, object = JSON)
  res.json({ message: "Welcome to the Bookshelf API" });
});

// ==================== CRUD OPERATIONS ====================
// Create = POST | Read = GET | Update = PUT/PATCH | Delete = DELETE

// CREATE - POST /books
// Data comes in req.body (parsed by express.json middleware)
// Client sends JSON like: { "title": "The Hobbit", "author": "Tolkien", ... }
app.post("/books", (req, res) => {
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
app.get("/books", (req, res) => {
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
app.get("/books/:id", (req, res) => {
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
app.put("/books/:id", (req, res) => {
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

app.delete("/books/:id", (req, res) => {
  const stmt = db.prepare("DELETE FROM books WHERE id=?");
  const result = stmt.run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Book not found" }); // 404 = "Not Found"
    return; // IMPORTANT: stop here so res.json below doesn't also run
  }
  res.json({ message: "Book deleted" });
});

// ==================== THREE WAYS DATA COMES FROM THE CLIENT ====================
// req.body   → JSON in request body (POST, PUT) - needs express.json() middleware
// req.params → from URL path like /books/:id    - automatic, no middleware needed
// req.query  → from URL after ? like /books?genre=Fantasy - automatic (used later for filtering)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
