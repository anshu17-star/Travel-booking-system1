const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

  db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], function(err) {
    if (err) return res.status(400).json({ error: 'Email already exists' });
    res.json({ success: true, message: 'Registration successful', userId: this.lastID, user: { id: this.lastID, name, email } });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid email or password' });
    res.json({ success: true, message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
  });
});

app.get('/api/destinations', (req, res) => {
  const { location, type } = req.query;
  let sql = "SELECT * FROM destinations WHERE 1=1";
  let params = [];

  if (location) {
    sql += " AND (location LIKE ? OR title LIKE ?)";
    params.push(`%${location}%`, `%${location}%`);
  }
  if (type && type !== 'All') {
    sql += " AND type = ?";
    params.push(type);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/bookings', (req, res) => {
  const { userId, destinationTitle, date, guests, totalPrice } = req.body;
  if (!userId || !destinationTitle || !date) return res.status(400).json({ error: 'Missing booking details' });

  db.run("INSERT INTO bookings (user_id, destination_title, date, guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?)",
    [userId, destinationTitle, date, guests || 1, totalPrice, 'Pending Payment'],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create booking' });
      res.json({ success: true, bookingId: this.lastID, message: 'Booking created successfully' });
    }
  );
});

app.get('/api/bookings', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID required' });

  db.all("SELECT * FROM bookings WHERE user_id = ? ORDER BY id DESC", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/pay', (req, res) => {
  const { bookingId, userId } = req.body;
  if (!bookingId || !userId) {
    return res.status(400).json({ error: 'Missing booking or user identification' });
  }

  db.run("UPDATE bookings SET status = 'Confirmed' WHERE id = ? AND user_id = ?", [bookingId, userId], function(err) {
    if (err) return res.status(500).json({ error: 'Payment failed due to database error' });
    if (this.changes === 0) {
      return res.status(403).json({ error: 'Payment unauthorized: Booking does not belong to the current user' });
    }
    res.json({ success: true, message: 'Payment successful! Booking confirmed.' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
