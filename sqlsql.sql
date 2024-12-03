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


Add a table for bills
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
