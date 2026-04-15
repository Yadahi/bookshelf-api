const express = require("express");
const app = express();
const port = 3000;
const Database = require("better-sqlite3");

// Initialize database
const db = new Database("bookshelf.db", { verbose: console.log });

// Create table
db.exec(`CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT,
    year INTEGER
)`);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Bookshelf API" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
