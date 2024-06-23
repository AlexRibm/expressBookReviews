// index.js

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware setup
app.use("/customer", session({
    secret: "fingerprint_customer", // Secret used to sign the session ID cookie
    resave: true, // Forces the session to be saved back to the session store
    saveUninitialized: true // Forces a session that is "uninitialized" to be saved to the store
}));

// Authentication middleware for routes under /customer/auth/
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization && req.session.authorization.accessToken) {
        let token = req.session.authorization.accessToken;

        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Endpoint to handle user registration


const PORT = 5000;

// Mount authenticated routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
