import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


// Connect to the database
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middleware to authenticate admin
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


// Admin login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = 'SELECT * FROM adminlogin WHERE username = ?';
    const [rows] = await db.execute(query, [email]);

    if (rows.length === 0) return res.status(400).send('Cannot find user');

    const user = rows[0];

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.name }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, adminName: user.name });
    } else {
      res.status(400).send('Incorrect password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error logging in');
  }
});

// Admin-specific routes (add, update, delete users, etc.)
// Example route to add a new driver
router.post('/add-driver', authenticateToken, async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO driverlogin (name, password) VALUES (?, ?)';
    await db.execute(query, [email, hashedPassword]);
    res.status(201).send('Driver added successfully');
  } catch (error) {
    console.error('Error adding driver:', error);
    res.status(500).send('Error adding driver');
  }
});

// Add more admin-specific routes as needed

export default router;
