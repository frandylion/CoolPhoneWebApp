// code provided by TA
// Imports
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const fsp = require('fs').promises;
const rw = require('random-words');

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
app.get('/revenueReport', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // total revenue
        const revenueQuery = 'SELECT SUM(cost) AS total_revenue FROM bill WHERE paid = true';
        const totalRevenue = await client.query(revenueQuery);
        sqlArray.push(revenueQuery);

        // average revenue per user
        const averageQuery = `
            WITH
                revenue_per_user AS (
                    SELECT user_id, SUM(cost) AS revenue
                    FROM bill
                    WHERE paid = true
                    GROUP BY user_id
                )
            SELECT AVG(revenue) AS avg_revenue
            FROM revenue_per_user
        `;
        const avgRevenue = await client.query(averageQuery);
        sqlArray.push(averageQuery);

        // unpaid bills
        const billsQuery = 'SELECT SUM(cost) AS outstanding_bills FROM bill WHERE paid = false';
        const billsResult = await client.query(billsQuery);
        sqlArray.push(billsQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        res.status(200).json({
            totalRevenue: totalRevenue.rows[0].total_revenue || 0,
            avgRevenue: avgRevenue.rows[0].avg_revenue || 0,
            outstandingBills: billsResult.rows[0].outstanding_bills || 0
        });
    } catch (err) {
        await client.query('ROLLBACK');
        sqlArray.push('ROLLBACK');

        console.error('Error:', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


app.get('/callsReport', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // total minutes
        const minutesQuery = 'SELECT SUM(duration) AS minutes FROM call_log';
        const total_minutes = await client.query(minutesQuery);
        sqlArray.push(minutesQuery);

        // percent minutes from local calls
        const localQuery = `
            WITH
                total_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log
                ),
                local_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log WHERE call_type = 'Local'
                )
            SELECT (l.minutes / t.minutes * 100) AS percent
            FROM total_minutes t, local_minutes l
        `;
        const percent_local = await client.query(localQuery);
        sqlArray.push(localQuery);

        // percent minutes from national calls
        const nationalQuery = `
            WITH
                total_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log
                ),
                national_minutes AS (
                    SELECT SUM(duration) AS minutes FROM call_log WHERE call_type = 'National'
                )
            SELECT (n.minutes / t.minutes * 100) AS percent
            FROM total_minutes t, national_minutes n
        `;
        const percent_national = await client.query(nationalQuery);
        sqlArray.push(nationalQuery);

        // average duration
        const averageQuery = 'SELECT AVG(duration) AS avg_duration FROM call_log';
        const average_duration = await client.query(averageQuery);
        sqlArray.push(averageQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        res.status(200).json({
            totalMinutes: total_minutes.rows[0].minutes || 0,
            percentLocal: percent_local.rows[0].percent || 0,
            percentNational: percent_national.rows[0].percent || 0,
            avgDuration: average_duration.rows[0].avg_duration || 0
        });
    } catch (err) {
        await client.query('ROLLBACK');
        sqlArray.push('ROLLBACK');

        console.error('Error:', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


// default user search
app.get('/userSearch', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // get all users
        const usersQuery = `
            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            ORDER BY u.user_id
            LIMIT 100
        `;
        const result = await client.query(usersQuery);
        sqlArray.push(usersQuery);

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


// User search with term
app.get('/userSearch/:term', async (req, res) => {
    const term = "%" + req.params.term + "%";
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // get all users
        const usersQuery = `
            WITH
                user_minutes AS (
                    SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                    FROM users u
                    LEFT JOIN call_log c ON c.user_id = u.user_id
                    GROUP BY u.user_id
                )
            SELECT
                u.user_id AS user_id,
                u.username AS username,
                u.password AS password,
                CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
                um.minutes AS total_minutes
            FROM users u
            JOIN user_plan up ON up.user_id = u.user_id
            LEFT JOIN user_minutes um ON um.user_id = u.user_id
            WHERE u.username LIKE $1
            ORDER BY u.user_id
            LIMIT 100
        `;
        const result = await client.query(usersQuery, [term]); // line 648
        sqlArray.push(usersQuery.replace('$1', term));

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


// generate an int of length len without 0 as the first digit
async function randInt(len) {
    let number = '' + (Math.floor(Math.random() * 9) + 1);

    for (let i = 1; i < len; i++) {
        number += Math.floor(Math.random() * 10);
    }

    return Number(number);
}


app.get('/addUser', async (req, res) => {
    // generate user values
    const username = rw.generate({min:2, max:3, minLength:3}).join('');
    const password = rw.generate({min:2, max:3, minLength:3}).join('');
    const last_name = rw.generate({max:1, minLength:6})[0];
    const first_name = rw.generate({max:1, minLength:4})[0];
    const phone_number = await randInt(10);
    let phone_model; // get phone_model from available models in database
    const admin = (Math.random() > 0.7);

    // generate user bank values
    const bank_account_num = await randInt(7);
    const card_num = await randInt(16);
    let bank_name; // get bank_name from existing bank names

    // get plan values from database
    let plan_type;
    let payment_type;

    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        // get random phone_model
        const randPhoneQuery = 'SELECT model FROM phone ORDER BY RANDOM() LIMIT 1';
        phone_model = (await client.query(randPhoneQuery)).rows[0].model;
        sqlArray.push(randPhoneQuery);

        // get random plan
        const randPlanQuery = 'SELECT plan_type, payment_type FROM plan ORDER BY RANDOM() LIMIT 1';
        const rand_plan = (await client.query(randPlanQuery)).rows[0];
        sqlArray.push(randPlanQuery);
        plan_type = rand_plan.plan_type;
        payment_type = rand_plan.payment_type;

        // get random bank name
        const randBankQuery = 'SELECT bank_name FROM bank ORDER BY RANDOM() LIMIT 1';
        bank_name = (await client.query(randBankQuery)).rows[0].bank_name;
        sqlArray.push(randBankQuery);

        // insert user values
        const insertUserQuery = 'INSERT INTO users VALUES (default, $1, $2, $3, $4, $5, $6, $7)';
        const insertUserResult = await client.query(insertUserQuery, [username, password, last_name, first_name, phone_number, phone_model, admin]);
        sqlArray.push(`INSERT INTO users VALUES (default, ${username}, ${password}, ${last_name}, ${first_name}, ${phone_number}, ${phone_model}, ${admin})`);

        // get user_id
        const idQuery = 'SELECT user_id FROM users WHERE username = $1';
        const user_id = (await client.query(idQuery, [username])).rows[0].user_id;

        // insert plan values
        const insertPlanQuery = 'INSERT INTO user_plan VALUES ($1, $2, $3)';
        const insertPlanResult = await client.query(insertPlanQuery, [user_id, plan_type, payment_type]);
        sqlArray.push(`INSERT INTO user_plan VALUES (${user_id}, ${plan_type}, ${payment_type})`);

        // insert bank values
        // TODO!!

        await client.query('COMMIT');
        sqlArray.push('COMMIT');
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


//  ######################
//  ## Start the server ##
//  ######################
let server = app.listen(3000, async () => {
    // clear the sql log if it exists
    await clearLog();

    console.log('Server is running on port 3000');
});
