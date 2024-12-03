// code provided by TA
// Imports
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Constants
const public_dir = 'public';
const login_page = 'login.html';
const home_page = 'home.hmtl';
const sql_log_path = 'log.sql';
const table_init_script = 'init_sim.sql';

//  ####################
//  ## Initialization ##
//  ####################
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
app.use(express.static(path.join(__dirname, public_dir)));

const pool = new Pool({
    user: 'dbs05',
    host: 'localhost',
    database: 'phone',
    password: 'pizza party',
    port: 5432,
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, public_dir, login_page));
});

// TODO function to save sql to file
async function saveSQL(lines) {
    // combine the array of inputs into a multiline string
    let output = "";
    for (const line of lines) {
        output += line + ';\n\n';
    }
    // add spacing between blocks of output for readability
    output += '\n\n';

    // append to the log file
    fs.appendFile(sql_log_path, output, 'utf8', error => {
        if (error) {
            console.error(`ERROR: Failed to append to sql log file with message --> \n${error}`);
        }
    });
}


//  ###########
//  ## Login ##
//  ###########
app.get('/home', async (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, public_dir, home_page));
    } else {
        res.send('Please login to access this page.');
        res.end();
    }
});

app.post('/auth', async (req, res) => {
    try {
    // get the input fields
    const { username, password } = req.body;

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
            const isValidPassword = await checkPassword(password, result.rows[0].password);

            if (isValidPassword) {
                // auth the user
                req.session.loggedin = true;
                req.session.username = username;
                req.session.user_id = result.rows[0].user_id;

                // redirect to home page
                res.redirect('/home');
            } else {
                // TODO: fix bad login to not change page
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
async function checkPassword(input, password) {
  return (input === password);
}

//  ##################
//  ## Front Office ##
//  ##################
app.get('/transaction', async (req, res) => {
    const user_id = req.session.user_id;

    try {
        const result = await pool.query('SELECT * FROM transaction WHERE user_id = $1', [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching transaction data:', err);
        res.sendStatus(500);
    }
});

// route to fetch total sum for a specified user_id
app.get('/transaction/sum/', async (req, res) => {
    const user_id = req.session.user_id;

    try {
        const result = await pool.query(
            'SELECT user_id, COALESCE(SUM(amount), 0) as total_amount FROM transaction WHERE user_id = $1 GROUP BY user_id',
            [user_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching summed transaction data:', err);
        res.status(500).json({ error: 'Error calculating sum' });
    }
});

//the function to make a payment
app.post('/make_payment', async (req, res) => {
    const user_id = req.session.user_id;
    const payment_amount = req.body.payment_amount;

    try {
        await pool.query('BEGIN');

        const balanceResult = await pool.query(
            'SELECT balance FROM bank WHERE user_id = $1 FOR UPDATE', [user_id]
        );
         if (balanceResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'user account not found' });
        }

        const userBalance = balanceResult.rows[0].balance;
        if (userBalance < payment_amount) {
            return res.status(400).json({ message: 'card declined' });
        }

        const updateBalance = await pool.query(
            'UPDATE bank SET balance = balance - $1 WHERE user_id = $2',
            [payment_amount, user_id]
        );

         const insertTransaction = await pool.query(
            'INSERT INTO transaction (user_id, transaction_date, transaction_type, amount) VALUES ($1, NOW(), $2, $3)',
            [user_id, 'payment', -payment_amount]
        );

        await pool.query('COMMIT');
        res.status(200).json({ message: 'payment successful' });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('error ', error);
        res.sendStatus(500);
    }
});

app.get('/call_log', async (req, res) => {
    const user_id = req.session.user_id;

    try {
        const result = await pool.query('SELECT * FROM call_log WHERE user_id = $1', [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('error ', err);
        res.sendStatus(500);
    }
});

app.get('/user', async (req, res) => {
    const user_id = req.session.user_id;

    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error('error ', err);
        res.sendStatus(500);
    }
});


//  #################
//  ## Back Office ##
//  #################


//  ################
//  ## Simulation ##
//  ################
app.get('/initializeTables', async (req, res) => {
    try {
        // read initialization script as array of queries delimited by ';'
        const script_blocks = fs.readFileSync(table_init_script, 'utf8').split(';');

        // TODO
    }
});


//  ######################
//  ## Start the server ##
//  ######################
let server = app.listen(3000, () => {
    // clear the sql log if it exists
    await clearLog();

    console.log('Server is running on port 3000');
});

async function clearLog() {
    // check if the log file exists
    fs.access(sql_log_path, fs.constants.F_OK, error => {
        if (error) {
            console.error(`WARNING: Skipping clearing log file with message --> \n${error}`);
        } else {
            // delete the file
            fs.rm(sql_log_path, error => {
                if (error) {
                    // exit if the program fails to clear the file
                    console.error(`ERROR: Failed to clear log file with message --> \n${error}\n\nExiting.`);
                    server.close( error => {
                        console.log('Server closed.');
                        process.exit(error ? 1 : 0);
                    });
                } else {
                    console.log('Succesfully cleared sql log file.');
                }
            });
        }
    });
};
