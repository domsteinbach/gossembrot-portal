const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt');

const app = express();
const secretKey = 'mastodon-testacy-glum-rung';


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'steinbach',  // dev
    password: 'test12345.6', // dev
    database: 'gossembrot',
    connectionLimit: 100, // Adjust the connection limit as needed
});

// Middleware to protect routes
const authenticate = jwtMiddleware({ secret: secretKey, algorithms: ['HS256'] });


app.post('/', (req, res) => {
    const { query, data } = req.body;

    // Check if the query tries to access restricted tables
    if (/users/i.test(query)) {  // Simple regex to detect the word "users" in the query
        console.error('Attempt to access restricted table:', query);
        res.status(403).json({ error: 'Access to this table is restricted' });
        return;
    }

    // Perform the query on the database
    pool.query(query, data, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message, 'Code:', err.code);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }

        // If it's an INSERT operation, fetch the newly inserted data
        if (query.startsWith('INSERT INTO region')) {
            const insertId = results.insertId; // Assuming you have an auto-incremented ID
            pool.query('SELECT * FROM region WHERE id = ?', [insertId], (err, selectResults) => {
                if (err) {
                    console.error('Error fetching inserted data:', err.message, 'Code:', err.code);
                    res.status(500).json({ error: 'Internal Server Error', details: err.message });
                    return;
                }
                res.json(selectResults[0]); // Return the newly inserted data
            });
        } else {
            // For non-INSERT operations, just return the query authors
            res.json(results);
        }
    });
});


// Protected update route
app.put('/update', authenticate, (req, res) => {
    const { query, data, dbName } = req.body;

    pool.query(query, data, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message, 'Code:', err.code);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }
        res.json(results);
    });
});

app.post('/login', (req, res) => {
    const { username, password, dbName } = req.body;

    pool.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }

        if (results.length === 0) {
            console.error('No user found with username:', username);
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log('Invalid password');
            res.status(401).json({ error: 'Invalid password' });
            return;
        }

        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d' });
        res.json({ token });
    });
});

// Handle a PUT request to update data in the MySQL database
app.put('/', (req, res) => {
    const { query, data } = req.body;

    // Perform the query on the database
    pool.query(query, data, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.message, 'Code:', err.code);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }

        // If it's an UPDATE operation for the 'region' table, fetch the updated data
        if (query.startsWith('UPDATE region')) {
            // Extract the identifier from the data or the query.
            // This example assumes you're using 'id' as the identifier and it's part of the data.
            const updatedId = data.id; // Adjust this based on your actual data structure and query format

            pool.query('SELECT * FROM region WHERE id = ?', [updatedId], (err, selectResults) => {
                if (err) {
                    console.error('Error fetching updated data:', err.message, 'Code:', err.code);
                    res.status(500).json({ error: 'Internal Server Error', details: err.message });
                    return;
                }
                res.json(selectResults[0]); // Return the updated data
            });
        } else {
            // For non-UPDATE operations, just return the query authors
            res.json(results);
        }
    });
});

app.post('/delete', (req, res) => {
    const { query, data } = req.body;
    // Perform the delete query on the database
    pool.query(query, data, (err, results) => {
        console.log('query in server.js', query);
        if (err) {
            console.error('Error executing delete query:', err.message, 'Code:', err.code);
            res.status(500).json({ error: 'Internal Server Error', details: err.message });
            return;
        }

        // If it's a DELETE operation for the 'region' table, you can send a confirmation message
        if (query.startsWith('DELETE FROM region')) {
            console.log('Data deleted by server.js');
            res.json({ message: 'Data successfully deleted', affectedRows: results.affectedRows });
        } else {
            // For non-DELETE operations, just return the query authors
            res.json(results);
        }
    });
});


// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
