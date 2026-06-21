const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});

// Get the book list available in the shop (async)
public_users.get('/', async function (req, res) {
  try {
    const bookData = await Promise.resolve(books);
    return res.status(200).send(JSON.stringify(bookData, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await Promise.resolve(books[isbn]);

    if (book) {
      return res.status(200).send(JSON.stringify(book, null, 4));
    }

    return res.status(404).json({message: "Book not found"});
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book details" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const keys = await Promise.resolve(Object.keys(books));
    const matched = [];

    keys.forEach(isbn => {
      if (books[isbn].author === author) {
        matched.push({isbn, ...books[isbn]});
      }
    });

    if (matched.length > 0) {
      return res.status(200).send(JSON.stringify(matched, null, 4));
    }

    return res.status(404).json({message: "No books found for that author"});
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const keys = await Promise.resolve(Object.keys(books));
    const matched = [];

    keys.forEach(isbn => {
      if (books[isbn].title === title) {
        matched.push({isbn, ...books[isbn]});
      }
    });

    if (matched.length > 0) {
      return res.status(200).send(JSON.stringify(matched, null, 4));
    }

    return res.status(404).json({message: "No books found with that title"});
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await Promise.resolve(books[isbn]);

    if (book && book.reviews) {
      return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    }

    return res.status(404).json({message: "Book not found"});
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book reviews" });
  }
});

module.exports.general = public_users;
    return res.status(500).json({ message: "Error fetching books", error: err.message });
