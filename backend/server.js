import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins or specify your frontend's origin
  }));
  

const startServer = async () => {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected to MySQL database');

    app.post('/api/register', async (req, res) => {
      const { email, password } = req.body;
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO driverlogin (name, password) VALUES (?, ?)';
        await db.execute(query, [email, hashedPassword]);
        res.status(201).send('User registered');
      } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Error registering user');
      }
    });

    app.post('/api/login', async (req, res) => {
      const { email, password } = req.body;
      try {
        const query = 'SELECT * FROM driverlogin WHERE name = ?';
        const [results] = await db.execute(query, [email]);
        if (results.length === 0) {
          return res.status(400).send('Invalid credentials');
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
      } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error logging in');
      }
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
  }
};

startServer();