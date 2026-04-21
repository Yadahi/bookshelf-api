const Database = require("better-sqlite3"); // better-sqlite3 is SYNCHRONOUS (unlike the "sqlite3" package which is async with callbacks)

// Initialize database - creates the file if it doesn't exist, connects to it if it does
// verbose: console.log prints every SQL query to terminal (remove later when it gets noisy)
const db = new Database(
  "bookshelf.db",
  // { verbose: console.log }
);

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

module.exports = db;
