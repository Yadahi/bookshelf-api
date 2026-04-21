const express = require("express"); // Import express (CommonJS style - using require because "type": "commonjs" in package.json)
const app = express(); // Create the app object - the heart of everything. All routes, middleware, config go through this.
const bookRoutes = require("./routes/books");

// Middleware: express.json() parses incoming JSON request bodies into req.body
// Without this, req.body is undefined. Express can SEND json (res.json) by default,
// but needs this middleware to READ incoming json.
// Middleware goes BEFORE routes that need it.
app.use(express.json());

// ==================== ROUTES ====================
// A route = HTTP method + path + handler function
// Handler receives: req (what the client sent) and res (how you respond)
app.use("/books", bookRoutes);

// GET / - Welcome message
app.get("/", (req, res) => {
  // res.json() sends JSON and sets Content-Type header to application/json
  // res.send() is more generic - detects type (string = HTML, object = JSON)
  res.json({ message: "Welcome to the Bookshelf API" });
});

// ==================== THREE WAYS DATA COMES FROM THE CLIENT ====================
// req.body   → JSON in request body (POST, PUT) - needs express.json() middleware
// req.params → from URL path like /books/:id    - automatic, no middleware needed
// req.query  → from URL after ? like /books?genre=Fantasy - automatic (used later for filtering)

app.use((err, req, res, next) => {
  console.log("index ERROR", err);
  // handle the error
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Something went wrong";
  res.status(statusCode).json({ error: message });
});

module.exports = app;
