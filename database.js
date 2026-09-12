const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./travel.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS destinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    location TEXT,
    type TEXT,
    price REAL,
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    destination_title TEXT,
    date TEXT,
    guests INTEGER,
    total_price REAL,
    status TEXT
  )`);

  const indianPlaces = [
    ["Taj Mahal & Heritage Tour", "Agra, Uttar Pradesh", "Tour", 2999, "/images/taj_mahal.jpg"],
    ["Goa Beach Resort & Stay", "Goa", "Hotel", 4500, "/images/goa_beach.jpg"],
    ["Jaipur Pink City Palace Flight", "Jaipur, Rajasthan", "Flight", 3800, "/images/jaipur_palace.jpg"],
    ["Kerala Houseboat Backwaters", "Alleppey, Kerala", "Tour", 5200, "/images/kerala_backwaters.jpg"],
    ["Manali Snow Peaks Resort", "Manali, Himachal Pradesh", "Hotel", 3500, "/images/manali_resort.jpg"],
    ["Varanasi Spiritual Ghats Tour", "Varanasi, Uttar Pradesh", "Tour", 2200, "/images/varanasi_ghats.jpg"],
    ["Ladakh Pangong Lake Expedition", "Leh Ladakh", "Tour", 8900, "/images/ladakh_lake.jpg"],
    ["Golden Temple & Cultural Flight", "Amritsar, Punjab", "Flight", 3100, "/images/golden_temple.png"],
    ["Darjeeling Tea Garden Resort", "Darjeeling, West Bengal", "Hotel", 4100, "/images/darjeeling_tea.jpg"],
    ["Udaipur Lake Palace Experience", "Udaipur, Rajasthan", "Hotel", 6500, "/images/udaipur_palace.jpg"],
    ["Rishikesh River Rafting Tour", "Rishikesh, Uttarakhand", "Tour", 2800, "/images/rishikesh_rafting.jpg"],
    ["Munnar Green Hills Stay", "Munnar, Kerala", "Hotel", 3700, "/images/munnar_hills.jpg"],
    ["Ooty Nilgiri Toy Train Flight", "Ooty, Tamil Nadu", "Flight", 4200, "/images/ooty_train.jpg"],
    ["Mysore Grand Palace Heritage", "Mysuru, Karnataka", "Tour", 2500, "/images/mysore_palace.jpg"],
    ["Andaman Scuba & Beach Tour", "Havelock, Andaman", "Tour", 9500, "/images/andaman_scuba.jpg"],
    ["Shimla Mountain Gateway", "Shimla, Himachal Pradesh", "Hotel", 3900, "/images/shimla_gateway.jpg"],
    ["Hampi Ancient Ruins Expedition", "Hampi, Karnataka", "Tour", 2700, "/images/hampi_ruins.png"],
    ["Meghalaya Living Root Bridges", "Shillong, Meghalaya", "Tour", 4800, "/images/meghalaya_bridges.png"]
  ];

  db.get("SELECT COUNT(*) AS count FROM destinations", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare("INSERT INTO destinations (title, location, type, price, image) VALUES (?, ?, ?, ?, ?)");
      indianPlaces.forEach(place => {
        stmt.run(place[0], place[1], place[2], place[3], place[4]);
      });
      stmt.finalize();
    } else {
      // Migrate all existing records in travel.db to local images
      const updateStmt = db.prepare("UPDATE destinations SET image = ? WHERE title = ?");
      indianPlaces.forEach(place => {
        updateStmt.run(place[4], place[0]);
      });
      updateStmt.finalize();
    }
  });
});

module.exports = db;
