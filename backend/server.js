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

    const authenticateToken = (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.sendStatus(401);
      }

      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    };

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
        const [rows] = await db.execute(query, [email]);

        if (rows.length === 0) {
          return res.status(400).send('Cannot find user');
        }

        const user = rows[0];

        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign({ email: user.name }, JWT_SECRET, { expiresIn: '1h' });
          res.json({ token, driverName: user.name });
        } else {
          res.status(400).send('Incorrect password');
        }
      } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error logging in');
      }
    });

    app.post('/api/start-trip', authenticateToken, async (req, res) => {
        const { trip, time } = req.body;
        const { email } = req.user;
      
        // Get the current date in the format you want
        const currentDate = new Date().toISOString().split('T')[0];
      
        try {
          const query = 'INSERT INTO trips (driver_name, trip, time, date) VALUES (?, ?, ?, ?)';
          const [result] = await db.execute(query, [email, trip, time, currentDate]);
          const tripId = result.insertId;
          res.json({ tripId });
        } catch (error) {
          console.error('Error starting trip:', error);
          res.status(500).json({ message: 'Error starting trip', error: error.message });
        }
      });

    app.post('/api/add-passenger', authenticateToken, async (req, res) => {
      const { name, paymentmode, tripId } = req.body;

      try {
        const query = 'INSERT INTO passengers (name, paymentmode, trip_id) VALUES (?, ?, ?)';
        const [result] = await db.execute(query, [name, paymentmode, tripId]);
        res.json({ id: result.insertId, message: 'Passenger added successfully' });
      } catch (error) {
        console.error('Error adding passenger:', error);
        res.status(500).send('Error adding passenger');
      }
    });

    app.post('/api/mark-departed', authenticateToken, async (req, res) => {
        const { id } = req.body;
      
        try {
          const query = 'UPDATE passengers SET is_deboarded = 1, deboarded_time = NOW() WHERE id = ?';
          await db.execute(query, [id]);
          res.send('Passenger marked as departed');
        } catch (error) {
          console.error('Error marking passenger as departed:', error);
          res.status(500).send('Error marking passenger as departed');
        }
      });
      
      app.post('/api/end-trip', authenticateToken, async (req, res) => {
        const { tripId } = req.body;
      
        try {
          const query = 'UPDATE passengers SET is_deboarded = 1, deboarded_time = NOW() WHERE trip_id = ? AND is_deboarded = 0';
          const [result] = await db.execute(query, [tripId]);
      
          // Respond successfully regardless of the number of affected rows
          res.send('Trip ended successfully');
        } catch (error) {
          console.error('Error ending trip:', error.message, error.stack); // Enhanced error logging
          res.status(500).send('Error ending trip');
        }
      });
      
      
    app.post('/api/change-password', authenticateToken, async (req, res) => {
      const { currentPassword, newPassword } = req.body;
      const { email } = req.user;

      try {
        const query = 'SELECT * FROM driverlogin WHERE name = ?';
        const [rows] = await db.execute(query, [email]);

        if (rows.length === 0) {
          return res.status(400).send('Cannot find user');
        }

        const user = rows[0];

        if (await bcrypt.compare(currentPassword, user.password)) {
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          const updateQuery = 'UPDATE driverlogin SET password = ? WHERE name = ?';
          await db.execute(updateQuery, [hashedNewPassword, email]);
          res.send('Password changed successfully');
        } else {
          res.status(400).send('Current password is incorrect');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send('Error changing password');
      }
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

startServer();
