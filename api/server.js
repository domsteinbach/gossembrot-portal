const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt');

const app = express();
const secretKey = 'mastodon-testacy-glum-rung'; // the key to encrypt and decrypt the JWT

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create a MySQL connection pool
const pools = {
  gossembrot: mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'gossembrot-web', // prod
    //user: 'steinbach',  // dev
    password: 'gsmbReadOnly.23', // prod
    //password: 'test12345.6', // dev
    database: 'gossembrot',
    connectionLimit: 150, // Adjust the connection limit as needed
  }),
  gossembrot_test: mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'gossembrot-web', // prod
    //user: 'steinbach',  // dev
    password: 'gsmbReadOnly.23', // prod
    //password: 'test12345.6', // dev
    database: 'gossembrot_test',
    connectionLimit: 150, // Adjust the connection limit as needed
  }),
};

// User login
app.post('/login', (req, res) => {
  const { username, password, dbName } = req.body;
  const pool = getPool(dbName);

  pool.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }

    if (results.length === 0) {
      console.error('No user found with username:', username);
      res.status(401).json({ error: 'Invalid username or password'});
      return;
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '7d' });
    res.json({ token });
  });
});

// Middleware to protect routes
const authenticate = jwtMiddleware({ secret: secretKey, algorithms: ['HS256'] });

function getPool(dbName) {
  return pools[dbName] || pools['gossembrot']; // default to 'gossembrot' if dbName not recognized
}

app.post('/', (req, res) => {

  const { query, data, dbName } = req.body;
  const pool = getPool(dbName);

  // Check if the query tries to access restricted tables
  if (/users/i.test(query)) {  // Simple regex to detect the word "users" in the query
    console.error('Attempt to access restricted table:', query);
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  // Perform the query on the database
  pool.query(query, data, (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message, 'Code:', err.code);
      res
        .status(500)
        .json({ error: 'Internal Server Error', details: err.message });
      return;
    }

    res.json(results);
  });
});

// Protected update route
app.put('/update', authenticate, (req, res) => {
  const { query, data, dbName } = req.body;
  const pool = getPool(dbName);

  pool.query(query, data, (err, results) => {
    if (err) {
      console.error('Error executing query:', err.message, 'Code:', err.code);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
      return;
    }
      res.json(results);
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
