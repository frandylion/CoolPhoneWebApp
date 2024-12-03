-- this code checks if the user is an admin and displays a user table if they are
-- the displaying the user data can be taken out if you don't want that to show on refresh
--assumes that there is a column in users called row and it can be set to admin
app.get('/adminView', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');


        const adminCheckQuery = 'SELECT role FROM users WHERE user_id = $1';
        const adminResult = await client.query(adminCheckQuery, [user_id]);
        sqlArray.push(adminCheckQuery);

        if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 'admin') {
            await client.query('ROLLBACK');
            sqlArray.push('ROLLBACK');
            saveSQL(sqlArray);
            return res.status(403).json({ error: 'error: not an admin' });
        }

        const usersQuery = 'SELECT * FROM users';
        const usersResult = await client.query(usersQuery);
        sqlArray.push(usersQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        saveSQL(sqlArray);
        return res.json(usersResult.rows);
    } catch (err) {
        console.error('error ', err);
        await client.query('ROLLBACK');
       sqlArray.push('ROLLBACK');
        saveSQL(sqlArray);
        res.sendStatus(500);
    } finally {
        client.release();
});



-- table to show all bills
app.get('/userBills', async (req, res) => {
    const user_id = req.session.user_id;
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');


        const billsQuery = 'SELECT bill_id, cost, due_date, paid FROM bill';
        const billsResult = await client.query(billsQuery, [user_id]);
        sqlArray.push(billsQuery);

        const balanceQuery = 'SELECT SUM(cost) AS total_due FROM bill WHERE user_id = $1 AND paid = false';
        const dueBalancet = await client.query(dueBalanceQuery, [user_id]);
        sqlArray.push(balanceQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        saveSQL(sqlArray);
        return res.json({
            unpaidBills: billsResult.rows,
            dueBalance: dueBalance.rows[0].total_due || 0
        });
    } catch (err) {
        console.error('error ', err);
        await client.query('ROLLBACK');
        sqlArray.push('ROLLBACK');
        saveSQL(sqlArray);
        res.sendStatus(500);
    } finally {
        client.release();
    }
});

app.get('revenueReport', async (req, res) => {
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

      --total revenue
        const revenueQuery = 'SELECT SUM(cost) AS total_revenue FROM bill WHERE paid = true';
        const totalRevenue = await client.query(revenueQuery);
        sqlArray.push(revenueQuery);

        -- average revenue per user
        const revenueQuery = `
            SELECT user_id, AVG(cost) AS avg_revenue
            FROM bill
            WHERE paid = true
            GROUP BY user_id
        `;
        const avgRevenue = await client.query(revenueQuery);
        sqlArray.push(revenueQuery);

        -- unpaid bills
        const billsQuery = 'SELECT SUM(cost) AS outstanding_bills FROM bill WHERE paid = false';
        const billsResult = await client.query(billsQuery);
        sqlArray.push(billsQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        saveSQL(sqlArray);

        return res.json({
            totalRevenue: totalRevenue.rows[0].total_revenue || 0,
            avgRevenue: avgRevenue.rows,
            outstandingBills: outstandingBillsResult.rows[0].outstanding_bills || 0
        });
    } catch (err) {
        console.error('Error:', err);
        await client.query('ROLLBACK');
        sqlArray.push('ROLLBACK');
        saveSQL(sqlArray);
        res.sendStatus(500);
    } finally {
        client.release();
    }
});
app.get('/searchUsers', async (req, res) => {
    const searchString = req.query.search || '';
    const client = await pool.connect();
    const sqlArray = [];

    try {
        await client.query('BEGIN');
        sqlArray.push('BEGIN');

        -- query to search by username
        const searchQuery = `
            SELECT u.username, u.password, u.plan_type, COALESCE(SUM(cl.duration), 0) AS total_call_minutes
            FROM users u
            LEFT JOIN call_log cl ON u.user_id = cl.user_id
            WHERE u.username ILIKE $1
            GROUP BY u.username, u.password, u.plan_type
        `;
        const searchResult = await client.query(searchQuery, [`%${searchString}%`]);
        sqlArray.push(searchQuery);

        await client.query('COMMIT');
        sqlArray.push('COMMIT');

        saveSQL(sqlArray);
        return res.json(searchResult.rows);
    } catch (err) {
        console.error('Error:', err);
        await client.query('ROLLBACK');
        sqlArray.push('ROLLBACK');
        saveSQL(sqlArray);
        res.sendStatus(500);
    } finally {
        client.release();
    }
});

