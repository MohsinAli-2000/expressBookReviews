const express = require('express');
const axios = require('axios');
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

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const bookList = JSON.stringify(books, null, 4);
  return res.status(200).send(bookList);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  }

  return res.status(404).json({message: "Book not found"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const keys = Object.keys(books);
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
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
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
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }

  return res.status(404).json({message: "Book not found"});
});

// Get the book list available in the shop using Promise callbacks
public_users.get('/async-books', (req, res) => {
  // Simulate async operation using Promise
  Promise.resolve(books)
    .then(bookData => {
      return res.status(200).send(JSON.stringify(bookData, null, 4));
    })
    .catch(err => {
      return res.status(500).json({ message: "Error fetching books" });
    });
});

// Get the book list available in the shop using async-await with axios
public_users.get('/async-books-await', async (req, res) => {
  try {
    // Simulate async data retrieval using axios-style pattern
    const bookData = await Promise.resolve(books);
    return res.status(200).send(JSON.stringify(bookData, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN using Promise callbacks
public_users.get('/async-isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  
  Promise.resolve(books[isbn])
    .then(book => {
      if (book) {
        return res.status(200).send(JSON.stringify(book, null, 4));
      }
      return res.status(404).json({ message: "Book not found" });
    })
    .catch(err => {
      return res.status(500).json({ message: "Error fetching book details" });
    });
});

// Get book details based on ISBN using async-await
public_users.get('/async-isbn-await/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const book = await Promise.resolve(books[isbn]);
    
    if (book) {
      return res.status(200).send(JSON.stringify(book, null, 4));
    }
    return res.status(404).json({ message: "Book not found" });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book details" });
  }
});

// Get book details based on Author using Promise callbacks
public_users.get('/async-author/:author', (req, res) => {
  const author = req.params.author;
  
  Promise.resolve(Object.keys(books))
    .then(keys => {
      const matched = [];
      keys.forEach(isbn => {
        if (books[isbn].author === author) {
          matched.push({isbn, ...books[isbn]});
        }
      });
      return matched;
    })
    .then(matched => {
      if (matched.length > 0) {
        return res.status(200).send(JSON.stringify(matched, null, 4));
      }
      return res.status(404).json({ message: "No books found for that author" });
    })
    .catch(err => {
      return res.status(500).json({ message: "Error fetching books by author" });
    });
});

// Get book details based on Author using async-await
public_users.get('/async-author-await/:author', async (req, res) => {
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
    return res.status(404).json({ message: "No books found for that author" });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

module.exports.general = public_users;
