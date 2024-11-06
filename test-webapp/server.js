// code provided by TA
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for cross-origin requests

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    user: 'dbs05',
    host: 'localhost',
    database: 'school',
    password: 'pizza party',
    port: 5432,
});

// Fetch data from PostgreSQL
app.get('/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM students');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// Update student name by ID
app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await pool.query('UPDATE students SET name = $1 WHERE id = $2', [name, id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// Add a new student
app.post('/students', async (req, res) => {
    const { name } = req.body;
    try {
        await pool.query('INSERT INTO students (name) VALUES ($1)', [name]);
        res.sendStatus(201); // Successfully created
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// Delete a student by ID
app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM students WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

