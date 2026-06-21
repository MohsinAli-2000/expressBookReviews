const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  if (!username) return false;
  // username is valid if it's not already taken
  return !users.some(u => u.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  if (!username || !password) return false;
  return users.some(u => u.username === username && u.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const payload = { username };
  const secret = process.env.JWT_SECRET || 'access';
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  // save token in session for authenticated routes
  req.session.accessToken = token;

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  const username = req.user && req.user.username ? req.user.username : (req.session && req.session.username);

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review for this user
  if (!book.reviews) book.reviews = {};
  book.reviews[username] = review;

  return res.status(200).send(JSON.stringify(book, null, 4));
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user && req.user.username ? req.user.username : (req.session && req.session.username);

  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Delete only the user's review
  delete book.reviews[username];

  return res.status(200).json({ message: "Review successfully deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
