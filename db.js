const Database = require("better-sqlite3"); // better-sqlite3 is SYNCHRONOUS (unlike the "sqlite3" package which is async with callbacks)

// Initialize database
const dbFile = process.env.NODE_ENV === "test" ? "test.db" : "bookshelf.db";
const db = new Database(dbFile);

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
