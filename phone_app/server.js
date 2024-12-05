// code provided by TA
// Imports
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const pg = require('pg');
const path = require('path');
const cors = require('cors');
const fsp = require('fs').promises;
const rw = require('random-words');

// Constants
const public_dir = 'public';
const login_page = 'login.html';
const home_page = 'home.html';
const admin_page = 'admin.html';
const readme_page = '../../README.md';
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
    saveUninitialized: true,
    cookie : {
        sameSite: 'strict',
    }
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, public_dir)));

const pool = new pg.Pool({
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
            // skip empty lines
            if (!line) {
                continue;
            }
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

app.get('/README', async (req, res) => {
    res.sendFile(path.join(__dirname, public_dir, readme_page));
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
            sqlArray.push('START TRANSACTION');
            await client.query('START TRANSACTION');

            // Query the database to find the user
            const userQuery = 'SELECT user_id, username, password FROM users WHERE username = $1';
            sqlArray.push(userQuery.replace('$1', username));
            const userResult = await client.query(userQuery, [username]);

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
                    res.status(400).send(`<h3>Incorrect username and/or password.</h3><a href='http://localhost:3000/'>Go back.</a>`);
                }
            } else {
                res.status(400).send(`<h3>No user found with that username.</h3><a href='http://localhost:3000/'>Go back.</a>`);
            }
        } else {
            res.status(400).send(`<h3>zPlease enter username and password.</h3><a href='http://localhost:3000/'>Go back.</a>`);
        }

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

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
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

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
        sqlArray.push(billsQuery.replace('$1', user_id.toString()));
        const billsResult = await client.query(billsQuery, [user_id]);
        
        // shows the balance
        const dueBalanceQuery = 'SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false';
        sqlArray.push(dueBalanceQuery.replace('$1', user_id.toString()));
        const dueBalance = await client.query(dueBalanceQuery, [user_id]);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.status(200).json({
            userBills: billsResult.rows,
            dueBalance: dueBalance.rows[0].total_due || 0
        });
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

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
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        // create transactions
        const transactionQuery = `
            INSERT INTO transaction (bill_id, date_paid)
            SELECT bill_id, CURRENT_DATE
            FROM bill
            WHERE user_id = $1 AND paid = false
        `;
        sqlArray.push(transactionQuery.replace('$1', user_id.toString()));
        const transactionResult = await client.query(transactionQuery, [user_id]);

        // set bills to paid
        const paidQuery = `
            UPDATE bill
            SET paid = true
            WHERE user_id = $1 AND paid = false
        `;
        sqlArray.push(paidQuery.replace('$1', user_id.toString()));
        const paidResult = await client.query(paidQuery, [user_id]);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.sendStatus(200);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

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
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

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
        sqlArray.push(transactionsQuery.replace('$1', user_id.toString()));
        const result = await client.query(transactionsQuery, [user_id]);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.status(200).json(result.rows);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

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
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

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
        sqlArray.push(callsQuery.replace('$1', user_id.toString()));
        const result = await client.query(callsQuery, [user_id]);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.status(200).json(result.rows);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

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
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        const userQuery = 'SELECT * FROM users WHERE user_id = $1 LIMIT 1';
        sqlArray.push(userQuery.replace('$1', user_id.toString()));
        const userResult = await client.query(userQuery, [user_id]);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

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
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        const adminQuery = 'SELECT * FROM users WHERE user_id = $1 AND admin = true LIMIT 1';
        sqlArray.push(adminQuery.replace('$1', user_id.toString()));
        const adminResult = await client.query(adminQuery, [user_id]);

        if (adminResult.rows.length > 0) {
            // redirect to admin page
            req.session.admin = true;
            res.redirect('/admin');
        } else {
            res.redirect('/home');
        }

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

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
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        // total revenue
        const revenueQuery = 'SELECT SUM(cost) AS total_revenue FROM bill WHERE paid = true';
        sqlArray.push(revenueQuery);
        const totalRevenue = await client.query(revenueQuery);

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
        sqlArray.push(averageQuery);
        const avgRevenue = await client.query(averageQuery);

        // unpaid bills
        const billsQuery = 'SELECT SUM(cost) AS outstanding_bills FROM bill WHERE paid = false';
        sqlArray.push(billsQuery);
        const billsResult = await client.query(billsQuery);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.status(200).json({
            totalRevenue: totalRevenue.rows[0].total_revenue || 0,
            avgRevenue: avgRevenue.rows[0].avg_revenue || 0,
            outstandingBills: billsResult.rows[0].outstanding_bills || 0
        });
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

        console.error('Error:', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


async function callTypePercentQuery(type, client, sqlArray) {
    const typeQuery = `
        WITH
            total_minutes AS (
                SELECT SUM(duration) AS minutes FROM call_log
            ),
            type_minutes AS (
                SELECT SUM(duration) AS minutes FROM call_log WHERE call_type = $1
            )
        SELECT (ty.minutes / t.minutes * 100) AS percent
        FROM total_minutes t, type_minutes ty
    `;
    sqlArray.push(typeQuery.replace('$1', `'${type}'`));
    return await client.query(typeQuery, [type]);
}


app.get('/callsReport', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        // total minutes
        const minutesQuery = 'SELECT SUM(duration) AS minutes FROM call_log';
        sqlArray.push(minutesQuery);
        const total_minutes = await client.query(minutesQuery);

        // percent minutes from local calls
        const percent_local = await callTypePercentQuery('Local', client, sqlArray);

        // percent minutes from national calls
        const percent_national = await callTypePercentQuery('National', client, sqlArray);

        // average duration
        const averageQuery = 'SELECT AVG(duration) AS avg_duration FROM call_log';
        sqlArray.push(averageQuery);
        const average_duration = await client.query(averageQuery);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.status(200).json({
            totalMinutes: total_minutes.rows[0].minutes || 0,
            percentLocal: percent_local.rows[0].percent || 0,
            percentNational: percent_national.rows[0].percent || 0,
            avgDuration: average_duration.rows[0].avg_duration || 0
        });
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

        console.error('Error:', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


async function queryUserSearch(term, client, sqlArray) {
    const termStr = `%${term}%`;

    // get all users matching term
    const usersQuery = `
        WITH
            user_minutes AS (
                SELECT u.user_id, COALESCE(SUM(c.duration), 0) AS minutes 
                FROM users u
                LEFT JOIN call_log c ON c.user_id = u.user_id
                GROUP BY u.user_id
            ),
            user_data AS (
                SELECT u.user_id, COALESCE(SUM(d.data_used_mib), 0) AS data
                FROM users u
                LEFT JOIN data_log d ON d.user_id = u.user_id
                GROUP BY u.user_id
            )
        SELECT
            u.user_id AS user_id,
            u.username AS username,
            u.password AS password,
            CONCAT(up.plan_type, ' ', up.payment_type) AS plan,
            um.minutes AS total_minutes,
            ud.data as total_data,
            u.admin as admin
        FROM users u
        JOIN user_plan up ON up.user_id = u.user_id
        LEFT JOIN user_minutes um ON um.user_id = u.user_id
        LEFT JOIN user_data ud ON ud.user_id = u.user_id
        WHERE u.username LIKE $1
        ORDER BY u.user_id
        LIMIT 100
    `;
    sqlArray.push(usersQuery.replace('$1', `'${termStr}'`));
    return await client.query(usersQuery, [termStr]);
}


// default user search
app.get('/userSearch', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        const result = await queryUserSearch('', client, sqlArray);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.status(200).json(result.rows);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

        console.error('error', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


// User search with term
app.get('/userSearch/:term', async (req, res) => {
    const term = req.params.term;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        const result = await queryUserSearch(term, client, sqlArray);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.status(200).json(result.rows);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

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
            sqlArray.push(query.trim());
            await client.query(query.trim());
        }

        // send successful status once all queries are run
        res.status(200).json('Successfully populated tables.');
        console.log('Successfully populated tables.');
    } catch (error) {
        console.error('ERROR: failed while initializing tables with message --> \n', error);

        if (client) {
            sqlArray.push('ROLLBACK');
            await client.query('ROLLBACK');
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
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        // get random phone_model
        const randPhoneQuery = 'SELECT model FROM phone ORDER BY RANDOM() LIMIT 1';
        sqlArray.push(randPhoneQuery);
        phone_model = (await client.query(randPhoneQuery)).rows[0].model;

        // get random plan
        const randPlanQuery = 'SELECT plan_type, payment_type FROM plan ORDER BY RANDOM() LIMIT 1';
        sqlArray.push(randPlanQuery);
        const rand_plan = (await client.query(randPlanQuery)).rows[0];
        plan_type = rand_plan.plan_type;
        payment_type = rand_plan.payment_type;

        // get random bank name
        const randBankQuery = 'SELECT bank_name FROM bank ORDER BY RANDOM() LIMIT 1';
        sqlArray.push(randBankQuery);
        bank_name = (await client.query(randBankQuery)).rows[0].bank_name;

        // insert user values
        const insertUserQuery = 'INSERT INTO users VALUES (default, $1, $2, $3, $4, $5, $6, $7)';
        sqlArray.push(`INSERT INTO users VALUES (default, '${username}', '${password}', '${last_name}, ${first_name}', ${phone_number}, '${phone_model}', ${admin})`);
        const insertUserResult = await client.query(insertUserQuery, [username, password, last_name, first_name, phone_number, phone_model, admin]);

        // get user_id
        const idQuery = 'SELECT user_id FROM users WHERE username = $1 LIMIT 1';
        const user_id = (await client.query(idQuery, [username])).rows[0].user_id;

        // insert plan values
        const insertPlanQuery = 'INSERT INTO user_plan VALUES ($1, $2, $3)';
        sqlArray.push(`INSERT INTO user_plan VALUES (${user_id}, '${plan_type}', '${payment_type}')`);
        const insertPlanResult = await client.query(insertPlanQuery, [user_id, plan_type, payment_type]);

        // insert bank values
        const insertBankQuery = 'INSERT INTO bank VALUES ($1, $2, $3, $4)';
        sqlArray.push(`INSERT INTO bank VALUES (${user_id}, ${bank_account_num}, ${card_num}, '${bank_name}')`);
        const insertBankResult = await client.query(insertBankQuery, [user_id, bank_account_num, card_num, bank_name]);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.sendStatus(200);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

        console.error('error', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


// from https://stackoverflow.com/a/29494612
async function twoDecimalRound(num) {
    return Math.round( num * 1e2 ) / 1e2;
}


// return a random weight duration that is not 0
async function weightedRandomDuration() {
    const maxVals = [10, 60, 200, 400];
    const cdf = [0.4, 0.7, 0.9, 1];

    return twoDecimalRound(0.01 + Math.random() * maxVals[cdf.findIndex(el => Math.random() <= el)]);
}


async function queryMonth(client, sqlArray) {
    const currMonthQuery = `
            SELECT (due_date - INTERVAL '1 month') AS date 
            FROM bill
            GROUP BY due_date
            ORDER BY due_date DESC
            LIMIT 1
        `;
    sqlArray.push(currMonthQuery);
    return (await client.query(currMonthQuery)).rows[0].date;
}


app.get('/getMonth', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        const currMonth = await queryMonth(client, sqlArray);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.status(200).json(currMonth);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

        console.error('error', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


app.get('/addCall/:monthYear', async (req, res) => {
    const monthYear = req.params.monthYear;

    // generate call values
    let user_id; // get random user from database
    const duration = Number(await weightedRandomDuration());
    let datetime; // construct the datetime
    const month = monthYear.split('-')[0];
    const year = monthYear.split('-')[1];
    const days_array = [31,28,31,30,31,30,31,31,30,31,30,31]; // for how many days in each month
    const day = Math.floor(Math.random() * days_array[month-1]) + 1;
    const time = `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60)}`;
    const call_type = (Math.random() < 0.7 ? 'Local' : 'National');
    const num_called = await randInt(10);

    const client = await pool.connect();
    const sqlArray = [];

    try {
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        // get random user_id
        const randUserQuery = 'SELECT user_id FROM users ORDER BY RANDOM() LIMIT 1';
        sqlArray.push(randUserQuery);
        user_id = (await client.query(randUserQuery)).rows[0].user_id;

        // concatenate the timestamp
        datetime = `${year}-${month}-${day} ${time}`;

        // insert values
        const insertCallQuery = 'INSERT INTO call_log VALUES (default, $1, $2, $3, $4, $5)';
        sqlArray.push(`INSERT INTO call_log VALUES (default, ${user_id}, ${duration}, '${datetime}', '${call_type}', ${num_called})`);
        const insertCallResult = await client.query(insertCallQuery, [user_id, duration, datetime, call_type, num_called]);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.sendStatus(200);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

        console.error('error', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


// pay all bills for all users
app.get('/payAllBills', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        // create transactions
        const transactionQuery = `
            INSERT INTO transaction (bill_id, date_paid)
            SELECT bill_id, CURRENT_DATE
            FROM bill
            WHERE paid = false
        `;
        sqlArray.push(transactionQuery);
        const transactionResult = await client.query(transactionQuery);

        // set bills to paid
        const paidQuery = `
            UPDATE bill
            SET paid = true
            WHERE paid = false
        `;
        sqlArray.push(paidQuery);
        const paidResult = await client.query(paidQuery);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.sendStatus(200);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

        console.error('error', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


async function generateBillsQuery(monthYear, client, sqlArray) {
    const year = Number(monthYear.split('-')[1]);
    const month = Number(monthYear.split('-')[0]);

    // delete old bills being replaced if any
    const deleteQuery = `
        DELETE FROM bill
        WHERE EXTRACT(YEAR FROM (due_date - INTERVAL '1 month')) = $1
          AND EXTRACT(MONTH FROM (due_date - INTERVAL '1 month')) = $2
    `;
    sqlArray.push(deleteQuery.replace('$1', year.toString()).replace('$2', month.toString()));
    const deleteResult = await client.query(deleteQuery, [year, month]);

    // generate new bills for every user
    const generateQuery = `
        WITH
            monthly_call_totals AS (
                SELECT 
                    user_id, 
                    EXTRACT(MONTH FROM call_date_time) AS bill_month,
                    EXTRACT(YEAR FROM call_date_time) AS bill_year,
                    SUM(CASE WHEN call_type = 'Local' THEN duration ELSE 0 END) AS total_local_minutes,
                    SUM(CASE WHEN call_type = 'National' THEN duration ELSE 0 END) AS total_national_minutes
                FROM call_log
                WHERE EXTRACT(YEAR FROM call_date_time) = $1
                  AND EXTRACT(MONTH FROM call_date_time) = $2
                GROUP BY user_id, bill_month, bill_year
            ),
            local_cost AS (
                SELECT cost_per_minute 
                FROM call_type 
                WHERE type_name = 'Local'
                LIMIT 1
            ),
            national_cost AS (
                SELECT cost_per_minute
                FROM call_type
                WHERE type_name = 'National'
                LIMIT 1
            )
        INSERT INTO bill (user_id, cost, due_date, paid)
        SELECT
            u.user_id,
            CASE
                WHEN up.payment_type = 'Prepaid' THEN p.data_cost
                WHEN up.payment_type = 'Postpaid' THEN
                    p.data_cost + 
                    (mct.total_local_minutes * lc.cost_per_minute) + 
                    (mct.total_national_minutes * nc.cost_per_minute)
            END AS bill_cost,
            -- sets due date to the 5th of the next month
            DATE(CONCAT(
                CASE 
                    WHEN mct.bill_month = 12 THEN mct.bill_year + 1 
                    ELSE mct.bill_year 
                END, 
                '-', 
                CASE 
                    WHEN mct.bill_month = 12 THEN 1 
                    ELSE mct.bill_month + 1 
                END, 
                '-5'
            )) AS due_date,
            false AS paid
        FROM users u
        JOIN user_plan up ON u.user_id = up.user_id
        JOIN plan p ON up.plan_type = p.plan_type AND up.payment_type = p.payment_type
        JOIN monthly_call_totals mct ON u.user_id = mct.user_id
        CROSS JOIN local_cost lc
        CROSS JOIN national_cost nc;
    `;
    sqlArray.push(generateQuery.replace('$1', year.toString()).replace('$2', month.toString()));
    const generateResult = await client.query(generateQuery, [year, month]);
}


// generate all bills
app.get('/generateBills/:monthYear', async (req, res) => {
    const monthYear = req.params.monthYear;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        await generateBillsQuery(monthYear, client, sqlArray);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.sendStatus(200);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

        console.error('error', err);
        res.sendStatus(500);
    } finally {
        client.release();
        saveSQL(sqlArray);
    }
});


// generate data for each user
app.get('/generateData/:monthYear', async (req, res) => {
    const monthYear = req.params.monthYear;
    const date = monthYear.split('-').reverse().join('-') + '-01';
    const client = await pool.connect();
    const sqlArray = [];

    try {
        sqlArray.push('START TRANSACTION');
        await client.query('START TRANSACTION');

        const dataInsertQuery = `
            INSERT INTO data_log (user_id, month, monthly_data_mib, data_used_mib)
            SELECT 
                u.user_id,
                $1 AS month,
                p.data_limit_mib AS monthly_data_mib,
                FLOOR(RANDOM() * (p.data_limit_mib + 1)) AS data_used_mib
            FROM users u
            JOIN user_plan up ON u.user_id = up.user_id
            JOIN plan p ON up.plan_type = p.plan_type 
             AND up.payment_type = p.payment_type
            WHERE NOT EXISTS (
                SELECT 1 
                FROM data_log dl 
                WHERE dl.user_id = u.user_id 
                AND dl.month = $1
            );
        `;
        sqlArray.push(dataInsertQuery.replace('$1', date));
        const dataInsertResult = await client.query(dataInsertQuery, [date]);

        sqlArray.push('END TRANSACTION');
        await client.query('END TRANSACTION');

        res.sendStatus(200);
    } catch (err) {
        sqlArray.push('ROLLBACK');
        await client.query('ROLLBACK');

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
