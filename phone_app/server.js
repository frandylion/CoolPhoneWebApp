// code provided by TA
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); // Enable CORS for cross-origin requests

// Login modules from tutorial (https://codeshack.io/basic-login-system-nodejs-express-mysql)
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    user: 'dbs05',
    host: 'localhost',
    database: 'phone',
    password: 'pizza party',
    port: 5432,
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/home', function(req, res) {
    if (req.session.loggedin) {
        res.send('Welcome back, ' + req.session.username + '!');
    } else {
        res.send('Please login to access this page.');
    }
    res.end();
});

app.post('/auth', async (req, res) => {
    try {
    // get the input fields
    const { username, password } = req.body;
    console.log('Username:', username);
    console.log('Password:', password);

    // check that the input fields are not empty
    if (username && password) {
        // Query the database to find the user
        const result = await pool.query(
            'SELECT user_id, username, password FROM users WHERE username = $1',
            [username]
        );
  
        // if user is found
        if (result.rows.length > 0) {
            // compare the entered password with the database
            // TODO: change this to use hashing later
            const isValidPassword = await checkPassword(password, result.rows[0].password);
  
            if (isValidPassword) {
                // auth the user
                req.session.loggedin = true;
                req.session.username = username;
                req.session.user_id = result.rows[0].user_id;
                
                // redirect to home page
                res.redirect('/home');
            } else {
                res.send('Incorrect username and/or password.');
            }
        } else {
            res.send('No user found with that username.');
        }
    } else {
        res.send('Please enter username and password.');
    }
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// checks the entered password against the stored password
// TODO: change to use hashing later
async function checkPassword(input, password) {
  return (input === password);
}

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

