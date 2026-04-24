const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const AppError = require("../utils/AppError");

const router = express.Router();

const validateCredetials = (username, password) => {
  if (!username) {
    return "Username is required";
  }

  if (!password || password.length < 4) {
    return "Password is required";
  }

  return null;
};

router.post("/register", (req, res, next) => {
  try {
    const { username, password } = req.body;
    const error = validateCredetials(username, password);
    if (error) {
      throw new AppError(error, 400);
    }

    const hashedPassword = bcrypt.hashSync(password);
    const stmt = db
      .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
      .run(username, hashedPassword);

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  try {
    const { username, password } = req.body;
    const stmt = db.prepare("SELECT * FROM users WHERE username=?");
    const result = stmt.get(username);
    const hashedPassword = result?.password;

    if (result) {
      const passwordMatch = bcrypt.compareSync(password, hashedPassword);
      if (!passwordMatch) {
        throw new AppError("Invalid credentials", 401);
      }

      // TODO define secret
      jwt.sign(
        { id: result.lastInsertRowid, username: result.username },
        SECRET_KEY,
        {
          expiresIn: "1h",
        },
      );

      res.status(200).json({ message: "User logged in" });
    } else {
      throw new AppError("Invalid credentials", 401);
    }
  } catch (error) {
    next(error);
  }
});
