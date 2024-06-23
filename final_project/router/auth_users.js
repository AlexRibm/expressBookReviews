const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");  // Ensure the correct path
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let usersWithSameName = users.filter((user) => {
        return user.username === username;
    });
    return usersWithSameName.length > 0;
}

const authenticatedUser = (username, password) => {
    let validUsers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validUsers.length > 0;
}

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Invalid credentials. Please provide both username and password." });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid login credentials." });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.body.review;
    const username = req.session.authorization.username;

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required." });
    }

    try {
        if (books[isbn]) {
            // Check if the user has already reviewed this book
            if (books[isbn].reviews[username]) {
                // User already has a review, modify it
                books[isbn].reviews[username] = reviewText;
                return res.status(200).json({ message: "Review successfully updated" });
            } else {
                // User has not reviewed this book, add a new review
                books[isbn].reviews[username] = reviewText;
                return res.status(200).json({ message: "Review successfully added" });
            }
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error("Error adding or updating review:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    try {
        if (books[isbn]) {
            // Check if the user has a review for this book
            if (books[isbn].reviews[username]) {
                // Remove the user's review for this book
                delete books[isbn].reviews[username];
                return res.status(200).json({ message: "Review successfully deleted" });
            } else {
                return res.status(404).json({ message: "User has not reviewed this book" });
            }
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;