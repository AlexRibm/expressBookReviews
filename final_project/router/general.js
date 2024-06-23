const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(409).json({ message: "User already exists!" });
        }
    } else {
        return res.status(400).json({ message: "Username and password are required" });
    }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Make a GET request to fetch the books
        const response = await axios.get(booksUrl);

        // Extract the books from the response data
        const books = response.data;

        // Send the response with the books data formatted nicely
        res.status(200).send(JSON.stringify(books, null, 4));
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Make a GET request to fetch the book details based on ISBN
        const response = await axios.get(`${booksUrl}/${isbn}`);

        // Extract the book details from the response data
        const book = response.data;

        // Send the response with the book details
        res.status(200).json(book);
    } catch (error) {
        console.error(`Error fetching book with ISBN ${isbn}:`, error);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: 'Book not found' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        // Make a GET request to fetch the books by author
        const response = await axios.get(`${booksUrl}?author=${author}`);

        // Extract the books by author from the response data
        const booksByAuthor = response.data;

        // Check if books were found
        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
        } else {
            res.status(404).json({ message: 'Author not found' });
        }
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error);
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: 'Author not found' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});
// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksByTitle = [];

    // Use Promise to filter books by title
    new Promise((resolve, reject) => {
        for (let key in books) {
            if (books[key].title === title) {
                booksByTitle.push(books[key]);
            }
        }
        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject({ message: "Title not found" });
        }
    })
    .then((booksByTitle) => {
        res.status(200).json(booksByTitle);
    })
    .catch((error) => {
        res.status(404).json(error);
    });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
