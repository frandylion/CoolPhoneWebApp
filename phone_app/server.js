// code provided by TA
// Imports
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const fsp = require('fs').promises;

// Constants
const public_dir = 'public';
const login_page = 'login.html';
const home_page = 'home.html';
const sql_log_path = 'log.sql';
const table_init_script = 'sim_init.sql';

//  ###########################
//  ## Server Initialization ##
//  ###########################
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


async function saveSQL(lines) {
    try {
        // combine the array of inputs into a multiline string
        let output = "";
        for (const line of lines) {
            output += line + ';\n\n';
        }
        // add spacing between blocks of output for readability
        output += '\n\n';

        // append to the log file
        fsp.appendFile(sql_log_path, output, 'utf8');
    } catch (error) {
        console.error(`ERROR: Failed to append to sql log file with message --> \n${error}`);
    }
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
// table to show all bills
app.get('/userBills', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // shows the bills and the total minutes and data used for that bill period
        const billsQuery = `
        SELECT 
            b.bill_id AS bill_id, 
            b.cost AS cost, 
            b.due_date AS due_date, 
            b.paid AS paid,
            COALESCE(SUM(c.duration), 0) AS total_minutes,
            COALESCE(SUM(d.data_used_mib), 0) AS data_used_mib
        FROM bill b
        LEFT JOIN call_log c ON c.user_id = b.user_id 
            AND EXTRACT(YEAR FROM c.call_date_time) = EXTRACT(YEAR FROM (b.due_date - INTERVAL '1 month'))
            AND EXTRACT(MONTH FROM c.call_date_time) = EXTRACT(MONTH FROM (b.due_date - INTERVAL '1 month'))
        LEFT JOIN data_log d ON d.user_id = b.user_id
            AND EXTRACT(YEAR FROM d.month) = EXTRACT(YEAR FROM (b.due_date - INTERVAL '1 month'))
            AND EXTRACT(MONTH FROM d.month) = EXTRACT(MONTH FROM (b.due_date - INTERVAL '1 month'))
        WHERE b.user_id = $1 
        GROUP BY b.bill_id
        ORDER BY b.bill_id DESC
        `;
        const billsResult = await client.query(billsQuery, [user_id]);
        sqlArray.push(billsQuery);
        
        // shows the balance
        const dueBalanceQuery = 'SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false';
        const dueBalance = await client.query(dueBalanceQuery, [user_id]);
        sqlArray.push(dueBalanceQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        res.status(200).json({
            userBills: billsResult.rows,
            dueBalance: dueBalance.rows[0].total_due || 0
        });
    } catch (err) {
        await client.query('ROLLBACK');
        sqlArray.push('ROLLBACK');

        console.error('error ', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


app.get('/userTransactions', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // fetches transactions and joins bill table
        const transactionsQuery = `
            SELECT 
                t.bill_id AS bill_id,
                b.cost AS cost,
                b.due_date AS due_date,
                t.date_paid AS date_paid
            FROM transaction t
            JOIN bill b ON b.bill_id = t.bill_id
            WHERE b.user_id = $1
            ORDER BY t.bill_id DESC
        `;
        const result = await client.query(transactionsQuery, [user_id]);
        sqlArray.push(transactionsQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        res.status(200).json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        sqlArray.push('ROLLBACK');

        console.error('error', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


// // route to fetch total sum for a specified user_id
// app.get('/transaction/sum/', async (req, res) => {
//     const user_id = req.session.user_id;

//     try {
//         const result = await pool.query(
//             'SELECT user_id, COALESCE(SUM(amount), 0) as total_amount FROM transaction WHERE user_id = $1 GROUP BY user_id',
//             [user_id]
//         );
//         res.json(result.rows[0]);
//     } catch (err) {
//         console.error('Error fetching summed transaction data:', err);
//         res.status(500).json({ error: 'Error calculating sum' });
//     }
// });


// // the function to make a payment
// app.post('/make_payment', async (req, res) => {
//     const user_id = req.session.user_id;
//     const payment_amount = req.body.payment_amount;

//     try {
//         await pool.query('BEGIN');

//         const balanceResult = await pool.query(
//             'SELECT balance FROM bank WHERE user_id = $1 FOR UPDATE', [user_id]
//         );
//          if (balanceResult.rows.length === 0) {
//             await pool.query('ROLLBACK');
//             return res.status(404).json({ message: 'user account not found' });
//         }

//         const userBalance = balanceResult.rows[0].balance;
//         if (userBalance < payment_amount) {
//             return res.status(400).json({ message: 'card declined' });
//         }

//         const updateBalance = await pool.query(
//             'UPDATE bank SET balance = balance - $1 WHERE user_id = $2',
//             [payment_amount, user_id]
//         );

//          const insertTransaction = await pool.query(
//             'INSERT INTO transaction (user_id, transaction_date, transaction_type, amount) VALUES ($1, NOW(), $2, $3)',
//             [user_id, 'payment', -payment_amount]
//         );

//         await pool.query('COMMIT');
//         res.status(200).json({ message: 'payment successful' });

//     } catch (error) {
//         await pool.query('ROLLBACK');
//         console.error('error ', error);
//         res.sendStatus(500);
//     }
// });


// app.get('/call_log', async (req, res) => {
//     const user_id = req.session.user_id;

//     try {
//         const result = await pool.query('SELECT * FROM call_log WHERE user_id = $1', [user_id]);
//         res.json(result.rows);
//     } catch (err) {
//         console.error('error ', err);
//         res.sendStatus(500);
//     }
// });


app.get('/user', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        const userQuery = 'SELECT * FROM users WHERE user_id = $1';
        const userResult = await client.query(userQuery, [user_id]);
        sqlArray.push(userQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        res.status(200).json(userResult.rows[0]);
    } catch (err) {
        console.error('error ', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


//  #################
//  ## Back Office ##
//  #################


//  ################
//  ## Simulation ##
//  ################
app.get('/initializeTables', async (req, res) => {
    let script_blocks;
    try {
        // read initialization script as array of queries delimited by ';'
        const script_contents = await fsp.readFile(table_init_script, 'utf8');

        // if file contents are undefined then exit
        if (!script_contents) {
            throw new Error('Error: Contents of table intialization script are undefined.');
        }

        script_blocks = await script_contents.split(';');
    } catch (error) {
        console.error('ERROR: failed to prepare table initialization script with message --> \n', error);
        res.status(500).json('Failed to populate tables.');
        return;
    }

    const client = await pool.connect();
    const sqlArray = [];

    // run the queries in the script
    try {
        for (const query of script_blocks) {
            await client.query(query.trim());
            sqlArray.push(query.trim());
        }

        // send successful status once all queries are run
        res.status(200).json('Successfully populated tables.');
        console.log('Successfully populated tables.');
    } catch (error) {
        console.error('ERROR: failed while initializing tables with message --> \n', error);

        if (client) {
            await client.query('ROLLBACK');
            sqlArray.push('ROLLBACK');
        }

        res.status(500).json('Failed to populate tables.');
    } finally {
        if (client) {
            client.release();
        }
        saveSQL(sqlArray);
    }
});


//  ######################
//  ## Start the server ##
//  ######################
let server = app.listen(3000, async () => {
    // clear the sql log if it exists
    await clearLog();

    console.log('Server is running on port 3000');
});

async function clearLog() {
    try {
        // check if log file exists
        await fsp.access(sql_log_path, fsp.constants.F_OK);
        
        // if file exists, attempt to remove it
        await fsp.rm(sql_log_path);
        
        console.log('Successfully cleared SQL log file.');
    } catch (error) {
        // if file does not exist, warn and continue
        if (error.code == 'ENOENT') {
            console.warn(`WARNING: Skipping clearing log file. File not found.`);
        } else {
            // if file exists but removal fails, close the server
            console.error(`ERROR: Failed to clear log file with message --> \n${error}\n\nExiting.`);
            server.close( error => {
                process.exit(error ? 1 : 0);
            });
        }
    }
}
