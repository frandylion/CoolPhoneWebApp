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
const admin_page = 'admin.html';
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


//  ###########
//  ## Pages ##
//  ###########
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, public_dir, login_page));
});


app.get('/home', async (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, public_dir, home_page));
    } else {
        res.send('Please login to access this page.');
        res.end();
    }
});

app.get('/admin', async (req, res) => {
    if (req.session.loggedin && req.session.admin) {
        res.sendFile(path.join(__dirname, public_dir, admin_page));
    } else {
        res.send('You must be an admin to access this page.');
        res.end();
    }
});


//  ###########
//  ## Login ##
//  ###########
app.post('/auth', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        // get the input fields
        const { username, password } = req.body;

        // check that the input fields are not empty
        if (username && password) {
            await client.query('BEGIN');
            sqlArray.push('BEGIN');

            // Query the database to find the user
            const userQuery = 'SELECT user_id, username, password FROM users WHERE username = $1';
            const userResult = await client.query(userQuery, [username]);
            sqlArray.push(userQuery.replace('$1', username));

            // if user is found
            if (userResult.rows.length > 0) {
                // compare the entered password with the database
                const isValidPassword = await checkPassword(password, userResult.rows[0].password);

                if (isValidPassword) {
                    // auth the user
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.user_id = userResult.rows[0].user_id;

                    // redirect to home page
                    res.redirect('/home');
                } else {
                    // TODO: fix bad login to not change page
                    res.status(400).send('Incorrect username and/or password.');
                }
            } else {
                res.status(400).send('No user found with that username.');
            }
        } else {
            res.status(400).send('Please enter username and password.');
        }

        await client.query('COMMIT');
        sqlArray.push('COMMIT');
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
            LIMIT 100
        `;
        const billsResult = await client.query(billsQuery, [user_id]);
        sqlArray.push(billsQuery.replace('$1', user_id.toString()));
        
        // shows the balance
        const dueBalanceQuery = 'SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false';
        const dueBalance = await client.query(dueBalanceQuery, [user_id]);
        sqlArray.push(dueBalanceQuery.replace('$1', user_id.toString()));

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


// for the customer to pay the bills
app.get('/payBills', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // create transactions
        const transactionQuery = `
            INSERT INTO transaction (bill_id, date_paid)
            SELECT bill_id, CURRENT_DATE
            FROM bill
            WHERE user_id = $1 AND paid = false
        `;
        const transactionResult = await client.query(transactionQuery, [user_id]);
        sqlArray.push(transactionQuery.replace('$1', user_id.toString()));

        // set bills to paid
        const paidQuery = `
            UPDATE bill
            SET paid = true
            WHERE user_id = $1 AND paid = false
        `;
        const paidResult = await client.query(paidQuery, [user_id]);
        sqlArray.push(paidQuery.replace('$1', user_id.toString()));

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        res.sendStatus(200);
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
            LIMIT 100
        `;
        const result = await client.query(transactionsQuery, [user_id]);
        sqlArray.push(transactionsQuery.replace('$1', user_id.toString()));

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


app.get('/userCalls', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // get call log records
        const callsQuery = `
            SELECT 
                cl.call_id AS call_id,
                cl.call_date_time AS date,
                cl.duration AS duration,
                cl.call_type AS call_type,
                (cl.duration * ct.cost_per_minute) AS cost
            FROM call_log cl
            JOIN call_type ct ON ct.type_name = cl.call_type
            WHERE cl.user_id = $1
            ORDER BY cl.call_date_time DESC
            LIMIT 100
        `;
        const result = await client.query(callsQuery, [user_id]);
        sqlArray.push(callsQuery.replace('$1', user_id.toString()));

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


app.get('/user', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        const userQuery = 'SELECT * FROM users WHERE user_id = $1';
        const userResult = await client.query(userQuery, [user_id]);
        sqlArray.push(userQuery.replace('$1', user_id.toString()));

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


// this code checks if the user is an admin and redirects to the admin page if they are
app.post('/adminView', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        const adminQuery = 'SELECT * FROM users WHERE user_id = $1 AND admin = true';
        const adminResult = await client.query(adminQuery, [user_id]);
        sqlArray.push(adminQuery.replace('$1', user_id.toString()));

        if (adminResult.rows.length > 0) {
            // redirect to admin page
            req.session.admin = true;
            res.redirect('/admin');
        } else {
            res.redirect('/home');
        }

        await client.query('COMMIT');
        sqlArray.push('COMMIT');
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
