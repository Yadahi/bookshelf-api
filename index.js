const express = require("express"); // Import express (CommonJS style - using require because "type": "commonjs" in package.json)
const app = express(); // Create the app object - the heart of everything. All routes, middleware, config go through this.
const port = 3000; // Port = a "door" on your computer. Clients knock on this door to talk to your server.
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
