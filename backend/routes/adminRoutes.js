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
      const token = jwt.sign({ id: user.id, email: user.name }, JWT_SECRET, { expiresIn: '5h' });
      res.json({ token, adminName: user.name });
    } else {
      res.status(400).send('Incorrect password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Error logging in');
  }
});


router.post('/add-admin', authenticateToken, async (req, res) => {
  const { username, password } = req.body;

  // Input validation for required fields
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into adminlogin table
    const query = `
      INSERT INTO adminlogin (username, password, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `;
    await db.execute(query, [username, hashedPassword]);

    res.status(201).json({ message: 'Admin added successfully and login created.' });
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({ message: 'Error adding admin. Please try again later.' });
  }
});



router.get('/get-dashboard-data', authenticateToken, async (req, res) => {
  try {
    // Get the count of drivers, buses, and routes
    const [drivers] = await db.execute('SELECT COUNT(*) AS count FROM drivers');
    const [buses] = await db.execute('SELECT COUNT(*) AS count FROM buses');
    const [routes] = await db.execute('SELECT COUNT(*) AS count FROM routes');

    // Get monthly statistics (example for the last 3 months)
    const [monthlyStats] = await db.execute(`
      SELECT MONTH(assigned_at) AS month, COUNT(*) AS value
      FROM bus_assignments
      WHERE assigned_at > NOW() - INTERVAL 3 MONTH
      GROUP BY MONTH(assigned_at);
    `);

    // Get the count of deboarded passengers grouped by paymentmode (online/offline)
    const [paymentModeStats] = await db.execute(`
      SELECT DATE(deboarded_time) AS date, paymentmode, COUNT(*) AS value
      FROM passengers
      WHERE deboarded_time > NOW() - INTERVAL 3 MONTH
      GROUP BY DATE(deboarded_time), paymentmode;
    `);

    // New Query: Get the count of passengers grouped by month for the pie chart
    const [passengerCountsByMonth] = await db.execute(`
      SELECT MONTH(deboarded_time) AS month, COUNT(*) AS count
      FROM passengers
      WHERE is_deboarded = 1
      GROUP BY MONTH(deboarded_time)
      ORDER BY MONTH(deboarded_time);
    `);

    // Structure the visitorChartData by grouping data by date
    const visitorChartData = paymentModeStats.reduce((acc, stat) => {
      const existing = acc.find(item => item.date === stat.date);
      if (existing) {
        existing[stat.paymentmode] = stat.value;
      } else {
        acc.push({
          date: stat.date,
          online: stat.paymentmode === 'online' ? stat.value : 0,
          offline: stat.paymentmode === 'offline' ? stat.value : 0
        });
      }
      return acc;
    }, []);

    // Send the data back
    res.status(200).json({
      counts: {
        drivers: drivers[0].count,
        buses: buses[0].count,
        routes: routes[0].count,
      },
      monthlyStats: monthlyStats,
      visitorChartData: visitorChartData,
      passengerPieChartData: passengerCountsByMonth, 
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    res.status(500).json({ message: 'An error occurred while fetching the data.' });
  }
});


router.get('/searchDriver', authenticateToken, async (req, res) => {
  const { term, fromDate, toDate } = req.query;
  if (!term) return res.status(400).json({ message: 'Search term is required' });

  try {
    const driverQuery = `
      SELECT id, driver_number, name, license_number, date_of_birth, email, phone
      FROM drivers
      WHERE driver_number = ? OR LOWER(name) LIKE ?
    `;

    let tripQuery = `
      SELECT 
        t.id AS trip_id, 
        t.bus_no, 
        t.date, 
        t.time, 
        t.end_time, 
        d.name AS driver_name,
        COALESCE(t.trip, 'Not Available') AS trip_route
      FROM 
        trips t
      JOIN 
        drivers d 
      ON 
        t.driver_no = d.driver_number
      WHERE 
        t.driver_no = ?
    `;

    const queryParams = [term, `%${term.toLowerCase()}%`];
    const tripQueryParams = [String(term)];

    if (fromDate && toDate) {
      tripQuery += ` AND t.date BETWEEN ? AND ?`;
      tripQueryParams.push(fromDate, toDate);
    }

    const [driverDetails] = await db.execute(driverQuery, queryParams);
    if (!driverDetails.length) {
      return res.status(404).json({ message: 'No matching driver found' });
    }

    const [trips] = await db.execute(tripQuery, tripQueryParams);
    if (!trips.length) {
      return res.status(404).json({
        message: 'No trips found for the driver in the specified date range',
        driverDetails: driverDetails[0],
        trips: []
      });
    }

    res.status(200).json({ driverDetails: driverDetails[0], trips });
  } catch (error) {
    console.error('Error executing search query:', error);
    res.status(500).json({ message: 'Error searching for driver. Please try again later.' });
  }
});




router.get('/searchBus', authenticateToken, async (req, res) => {
  const { busNo, fromDate, toDate } = req.query;
  if (!busNo) return res.status(400).json({ message: 'Bus number is required' });

  try {
    let tripQuery = `
      SELECT 
        t.id AS trip_id, 
        t.bus_no, 
        t.date, 
        t.time, 
        t.end_time, 
        t.driver_no, 
        d.name AS driver_name,
        COALESCE(t.trip, 'Not Available') AS trip_route
      FROM 
        trips t
      JOIN 
        drivers d 
      ON 
        t.driver_no = d.driver_number
      WHERE 
        t.bus_no = ?
    `;

    const tripQueryParams = [busNo];

    if (fromDate && toDate) {
      tripQuery += ` AND t.date BETWEEN ? AND ?`;
      tripQueryParams.push(fromDate, toDate);
    }

    const [tripDetails] = await db.execute(tripQuery, tripQueryParams);
    if (!tripDetails.length) {
      return res.status(404).json({
        message: 'No trips found for the bus in the specified date range',
        tripDetails: []
      });
    }

    res.status(200).json({
      tripDetails: tripDetails,
      message: 'Bus search successful'
    });
  } catch (error) {
    console.error('Error executing search query:', error);
    res.status(500).json({ message: 'Error searching for bus. Please try again later.' });
  }
});





router.get('/trip/:trip_id/passengers', authenticateToken, async (req, res) => {
  const { trip_id } = req.params;
  
  try {
    const passengerQuery = `
      SELECT p.name AS passengerName, p.paymentmode, p.is_deboarded, p.deboarded_time
      FROM passengers p
      WHERE p.trip_id = ?
    `;
    const [passengers] = await db.execute(passengerQuery, [trip_id]);

    res.status(200).json({ passengerList: passengers });
  } catch (error) {
    console.error('Error fetching passengers:', error);
    res.status(500).json({ message: 'Error fetching passengers for the trip.' });
  }
});






router.post('/add-driver', authenticateToken, async (req, res) => {
  const { driverNumber, name, licenseNumber, dateOfBirth, email, phone, username, password } = req.body;

  // Input validation for required fields
  if (!driverNumber || !name || !licenseNumber || !dateOfBirth || !email || !phone || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
  const [existingDriver] = await db.execute(
    `SELECT driver_number FROM drivers WHERE TRIM(LOWER(driver_number)) = ?`,
    [driverNumber.trim().toLowerCase()]
  );

  if (existingDriver.length > 0) {
    return res.status(400).json({ message: 'Driver number already exists. Please use a unique driver number.' });
  }

    // Check if the username already exists in the driverlogin table
    const [existingUser] = await db.execute(
      `SELECT name FROM driverlogin WHERE name = ?`,
      [username]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username already exists. Please choose a different username.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into drivers table
    const driverQuery = `
      INSERT INTO drivers (driver_number, name, license_number, date_of_birth, email, phone, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    await db.execute(driverQuery, [driverNumber, name, licenseNumber, dateOfBirth, email, phone]);

    // Insert into driverlogin table
    const loginQuery = `
      INSERT INTO driverlogin (driver_no, name, password)
      VALUES (?, ?, ?)
    `;
    await db.execute(loginQuery, [driverNumber, username, hashedPassword]);

    res.status(201).json({ message: 'Driver added successfully and login created.' });
  } catch (error) {
    console.error('Error adding driver:', error);
    res.status(500).json({ message: 'Error adding driver. Please try again later.' });
  }
});


// Route to get driver details by driver number
router.get('/drivers/:driverNumber', authenticateToken, async (req, res) => {
  const { driverNumber } = req.params;

  try {
    const query = 'SELECT * FROM drivers WHERE driver_number = ?';
    const [rows] = await db.execute(query, [driverNumber]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const driver = rows[0];

    res.status(200).json({
      driverNumber: driver.driver_number,
      name: driver.name,
      licenseNumber: driver.license_number,
      dateOfBirth: driver.date_of_birth,
      email: driver.email,
      phone: driver.phone
    });
  } catch (error) {
    console.error('Error fetching driver details:', error);
    res.status(500).json({ message: 'Error fetching driver details' });
  }
});

router.put('/update-driver/:driverNumber', authenticateToken, async (req, res) => {
  const { driverNumber } = req.params;
  const { name, licenseNumber, dateOfBirth, email, phone } = req.body;

  if (!name || !licenseNumber || !dateOfBirth || !email || !phone) {
    return res.status(400).send('All fields are required');
  }

  try {
    const query = `
      UPDATE drivers 
      SET name = ?, license_number = ?, date_of_birth = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE driver_number = ?
    `;
    const [result] = await db.execute(query, [name, licenseNumber, dateOfBirth, email, phone, driverNumber]);

    if (result.affectedRows === 0) {
      return res.status(404).send('Driver not found');
    }

    res.send('Driver updated successfully');
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).send('Error updating driver');
  }
});


router.delete('/delete-driver/:driverNumber', authenticateToken, async (req, res) => {
  const { driverNumber } = req.params;

  try {

    // First, delete from the drivers table
    const deleteDriverQuery = 'DELETE FROM drivers WHERE driver_number = ?';
    const [driverResult] = await db.execute(deleteDriverQuery, [driverNumber]);

    console.log('Driver deletion result:', driverResult);

    if (driverResult.affectedRows === 0) {
      console.log('No rows affected. Driver not found.');
      return res.status(404).json({ message: 'Driver not found' });
    }

    // Then, delete from the driverlogin table
    const deleteDriverLoginQuery = 'DELETE FROM driverlogin WHERE driver_no = ?';
    const [loginResult] = await db.execute(deleteDriverLoginQuery, [driverNumber]);


    if (loginResult.affectedRows === 0) {
      console.log('No rows affected in driverlogin. No matching login found.');
      // It's safe to proceed even if the login record is not found, but logging it for clarity
    }

    res.status(200).json({ message: 'Driver and corresponding login deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver and login:', error);
    res.status(500).json({ message: 'Error deleting driver and login' });
  }
});


// Route to add a new bus
router.post('/add-bus', authenticateToken, async (req, res) => {
  const { busNo, plateNumber, vin, capacity, busModel, manufactureYear, fuelType } = req.body;

  // Input validation
  if (!busNo || !plateNumber || !vin || !capacity || !busModel || !manufactureYear || !fuelType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const query = `
      INSERT INTO buses (bus_no, plate_number, vin, capacity, bus_model, manufacture_year, fuel_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    await db.execute(query, [busNo, plateNumber, vin, capacity, busModel, manufactureYear, fuelType]);

    res.status(201).json({ message: 'Bus added successfully' });
  } catch (error) {
    console.error('Error adding bus:', error);
    res.status(500).json({ message: 'Error adding bus' });
  }
});


// Route to get bus details by bus number
router.get('/buses/:busNo', authenticateToken, async (req, res) => {
  const { busNo } = req.params;

  try {
    const query = 'SELECT * FROM buses WHERE bus_no = ?';
    const [rows] = await db.execute(query, [busNo]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const bus = rows[0];

    res.status(200).json({
      busNo: bus.bus_no,
      plateNumber: bus.plate_number,
      vin: bus.vin,
      capacity: bus.capacity,
      busModel: bus.bus_model,
      manufactureYear: bus.manufacture_year,
      fuelType: bus.fuel_type,
      createdAt: bus.created_at,
      updatedAt: bus.updated_at
    });
  } catch (error) {
    console.error('Error fetching bus details:', error);
    res.status(500).json({ message: 'Error fetching bus details' });
  }
});


// Route to update bus details
router.put('/update-bus/:busNo', authenticateToken, async (req, res) => {
  const { busNo } = req.params;
  const { plateNumber, vin, capacity, busModel, manufactureYear, fuelType } = req.body;

  // Input validation
  if (!plateNumber || !vin || !capacity || !busModel || !manufactureYear || !fuelType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const query = `
      UPDATE buses 
      SET plate_number = ?, vin = ?, capacity = ?, bus_model = ?, manufacture_year = ?, fuel_type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE bus_no = ?
    `;
    const [result] = await db.execute(query, [plateNumber, vin, capacity, busModel, manufactureYear, fuelType, busNo]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.status(200).json({ message: 'Bus updated successfully' });
  } catch (error) {
    console.error('Error updating bus:', error);
    res.status(500).json({ message: 'Error updating bus' });
  }
});


router.delete('/delete-bus/:bus_no', authenticateToken, async (req, res) => {
  const { bus_no } = req.params; 
  console.log('Received DELETE request for bus_no:', bus_no);

  try {
    // Check if the bus exists
    const [bus] = await db.query('SELECT * FROM buses WHERE bus_no = ?', [bus_no]);

    if (bus.length === 0) {
      // No bus found
      return res.status(404).json({ message: 'Bus not found.' });
    }

    // Delete the bus
    const [deleteResult] = await db.query('DELETE FROM buses WHERE bus_no = ?', [bus_no]);
    console.log('Delete operation result:', deleteResult);

    if (deleteResult.affectedRows > 0) {
      // Bus deleted successfully
      res.status(200).json({ message: 'Bus deleted successfully.' });
    } else {
      // Bus not found or already deleted (edge case)
      res.status(404).json({ message: 'Bus not found or already deleted.' });
    }
  } catch (err) {
    console.error('Error deleting bus:', err);
    // Internal server error
    res.status(500).json({ message: 'An error occurred while deleting the bus.' });
  }
});




router.post('/add-route', authenticateToken, async (req, res) => {
  const { from, to } = req.body;

  // Validate input
  if (!from || !to) {
    return res.status(400).json({ message: 'Both "from" and "to" fields are required.' });
  }

  try {
    const checkQuery = `
      SELECT COUNT(*) AS count
      FROM routes
      WHERE LOWER(from_location) = LOWER(?) AND LOWER(to_location) = LOWER(?)
    `;
    const [rows] = await db.execute(checkQuery, [from, to]);

    if (rows[0].count > 0) {
      return res.status(409).json({ message: 'This route already exists.' });
    }

    const query = `
      INSERT INTO routes (from_location, to_location, created_at, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    await db.execute(query, [from, to]);

    res.status(201).json({ message: 'Route added successfully.' });
  } catch (error) {
    console.error('Error adding route:', error);
    res.status(500).json({ message: 'Error adding route. Please try again.' });
  }
});


router.get('/drivers', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, driver_number, name FROM drivers'); // Fetch `id` from DB
    const drivers = rows.map(driver => ({
      value: driver.id, // Send `id` as value
      label: `${driver.name} (${driver.driver_number})`, // Display name + driver_number
    }));
    res.status(200).json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Error fetching drivers' });
  }
});


// Get all buses
router.get('/buses', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, bus_no FROM buses WHERE bus_no IS NOT NULL');
    const buses = rows.map(bus => ({
      value: bus.id,    // Use `id` for value
      label: bus.bus_no // Use `bus_no` for label
    }));
    res.status(200).json(buses);
  } catch (error) {
    console.error('Error fetching buses:', error);
    res.status(500).json({ message: 'Error fetching buses' });
  }
});



// Get all routes
router.get('/routes', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, CONCAT(from_location, " -> ", to_location) AS route FROM routes');
    const routes = rows.map(route => ({
      value: route.id,
      label: route.route,
    }));
    res.status(200).json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ message: 'Error fetching routes' });
  }
});


router.post('/assign-driver', authenticateToken, async (req, res) => {
  const { busId, driverIds, routeIds } = req.body;
  const adminId = req.user.id; // Added by `authenticateToken`

  // Input Validation
  if (
    typeof busId !== 'number' ||
    !Array.isArray(driverIds) || driverIds.length === 0 ||
    !Array.isArray(routeIds) || routeIds.length === 0
  ) {
    console.log('Invalid payload:', req.body); // Log invalid payload
    return res.status(400).json({ message: 'Invalid payload: Provide a valid busId, driverIds, and routeIds.' });
  }

  try {


    // Check if the bus exists
    const [bus] = await db.execute('SELECT id FROM buses WHERE id = ?', [busId]);
    if (bus.length === 0) {
      console.log('Bus not found:', busId);
      return res.status(400).json({ message: `Bus with ID ${busId} does not exist.` });
    }

    // Ensure driver IDs are integers
    const sanitizedDriverIds = driverIds.map(id => parseInt(id));
    console.log('Sanitized Driver IDs:', sanitizedDriverIds);

    // Check if all driver IDs exist
    const driverPlaceholders = sanitizedDriverIds.map(() => '?').join(', ');
    const driverQuery = `SELECT id FROM drivers WHERE id IN (${driverPlaceholders})`;
    const [drivers] = await db.execute(driverQuery, sanitizedDriverIds);

    if (drivers.length !== sanitizedDriverIds.length) {
      const foundIds = drivers.map(driver => driver.id);
      const invalidIds = sanitizedDriverIds.filter(id => !foundIds.includes(id));
      console.log('Invalid Driver IDs:', invalidIds);
      return res.status(400).json({ message: `Invalid Driver IDs: ${invalidIds.join(', ')}` });
    }

    // Ensure route IDs are integers
    const sanitizedRouteIds = routeIds.map(id => parseInt(id));

    // Check if all route IDs exist
    const routePlaceholders = sanitizedRouteIds.map(() => '?').join(', ');
    const routeQuery = `SELECT id FROM routes WHERE id IN (${routePlaceholders})`;
    const [routes] = await db.execute(routeQuery, sanitizedRouteIds);

    if (routes.length !== sanitizedRouteIds.length) {
      const foundIds = routes.map(route => route.id);
      const invalidIds = sanitizedRouteIds.filter(id => !foundIds.includes(id));
      console.log('Invalid Route IDs:', invalidIds);
      return res.status(400).json({ message: `Invalid Route IDs: ${invalidIds.join(', ')}` });
    }


    // Prepare the batch insert values
    const values = sanitizedDriverIds.flatMap(driverId =>
      sanitizedRouteIds.map(routeId => [busId, driverId, routeId, adminId])
    );

    // Perform the batch insert
    const insertQuery = `
      INSERT INTO bus_assignments (bus_id, driver_id, route_id, assigned_by)
      VALUES ?
    `;
    await db.query(insertQuery, [values]);

    return res.status(201).json({ message: 'Drivers assigned successfully.' });
  } catch (error) {
    console.error('Error assigning drivers:', error.message);
    console.error('Full error details:', error);
    return res.status(500).json({ message: 'An error occurred while assigning drivers. Please try again.' });
  }
});


// PUT: Update assignment status
router.put('/assign-driver/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const adminId = req.user.id; // Added by `authenticateToken`

  // Input Validation
  if (!status) {
    return res.status(400).json({ message: 'Status field is required.' });
  }

  try {
    // Update the status of the assignment
    const updateQuery = `
      UPDATE bus_assignments
      SET status = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const [result] = await db.execute(updateQuery, [status, adminId, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    return res.status(200).json({ message: 'Assignment updated successfully.' });
  } catch (error) {
    console.error('Error updating assignment:', error.message);
    return res.status(500).json({ message: 'An error occurred while updating the assignment.' });
  }
});


export default router;
