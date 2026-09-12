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

  db.get("SELECT COUNT(*) AS count FROM destinations", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare("INSERT INTO destinations (title, location, type, price, image) VALUES (?, ?, ?, ?, ?)");

      const indianPlaces = [
        ["Taj Mahal & Heritage Tour", "Agra, Uttar Pradesh", "Tour", 2999, "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500"],
        ["Goa Beach Resort & Stay", "Goa", "Hotel", 4500, "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500"],
        ["Jaipur Pink City Palace Flight", "Jaipur, Rajasthan", "Flight", 3800, "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=500"],
        ["Kerala Houseboat Backwaters", "Alleppey, Kerala", "Tour", 5200, "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500"],
        ["Manali Snow Peaks Resort", "Manali, Himachal Pradesh", "Hotel", 3500, "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=500"],
        ["Varanasi Spiritual Ghats Tour", "Varanasi, Uttar Pradesh", "Tour", 2200, "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=500"],
        ["Ladakh Pangong Lake Expedition", "Leh Ladakh", "Tour", 8900, "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=500"],
        ["Golden Temple & Cultural Flight", "Amritsar, Punjab", "Flight", 3100, "https://images.unsplash.com/photo-1588096344356-78d78794c929?w=500"],
        ["Darjeeling Tea Garden Resort", "Darjeeling, West Bengal", "Hotel", 4100, "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500"],
        ["Udaipur Lake Palace Experience", "Udaipur, Rajasthan", "Hotel", 6500, "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=500"],
        ["Rishikesh River Rafting Tour", "Rishikesh, Uttarakhand", "Tour", 2800, "https://images.unsplash.com/photo-1590766940554-634a7ed41450?w=500"],
        ["Munnar Green Hills Stay", "Munnar, Kerala", "Hotel", 3700, "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=500"],
        ["Ooty Nilgiri Toy Train Flight", "Ooty, Tamil Nadu", "Flight", 4200, "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=500"],
        ["Mysore Grand Palace Heritage", "Mysuru, Karnataka", "Tour", 2500, "https://images.unsplash.com/photo-1600100397608-f010f423b971?w=500"],
        ["Andaman Scuba & Beach Tour", "Havelock, Andaman", "Tour", 9500, "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=500"],
        ["Shimla Mountain Gateway", "Shimla, Himachal Pradesh", "Hotel", 3900, "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=500"],
        ["Hampi Ancient Ruins Expedition", "Hampi, Karnataka", "Tour", 2700, "https://images.unsplash.com/photo-1600100395162-42353346d0a7?w=500"],
        ["Meghalaya Living Root Bridges", "Shillong, Meghalaya", "Tour", 4800, "https://images.unsplash.com/photo-1626014903708-468205c6d311?w=500"]
      ];

      indianPlaces.forEach(place => {
        stmt.run(place[0], place[1], place[2], place[3], place[4]);
      });

      stmt.finalize();
    }
  });
});

module.exports = db;
