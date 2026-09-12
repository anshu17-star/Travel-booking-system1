# Travel Booking System (Internship Project)

A simple, lightweight Travel Booking Web Application created using standard web technologies with popular Indian destinations.

## Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla ES6)
- **Backend**: Node.js & Express
- **Database**: SQLite3 (`travel.db`)

## Features
1. **User Interface**: Wireframed responsive layout with hero banner, travel search, and card grids.
2. **User Registration & Authentication**: Sign up and login with SQLite database persistence.
3. **Search & Booking Functionality**: Search flights, hotels, and tours across 18 famous Indian places.
4. **Payment Integration**: Interactive Payment Gateway simulation with instant booking confirmation.
5. **My Bookings Dashboard**: View all confirmed travel reservations.

---

## How to Run Locally

1. Open terminal in the project directory:
   ```bash
   cd "d:\New folder (4)"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your web browser and go to:
   ```
   http://localhost:3000
   ```

---

## Free Hosting / Deployment Options (Task 8)

### Option A: Hosting on Render (Recommended Free Provider)
1. Push your project code to GitHub (exclude `node_modules`).
2. Go to [Render.com](https://render.com) and create a free account.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click **Create Web Service**. Your website will be live at `https://your-app-name.onrender.com`.

### Option B: Hosting on Glitch
1. Go to [Glitch.com](https://glitch.com).
2. Import from GitHub or drag and drop your project files.
3. Glitch automatically runs `npm start` and gives you a free live URL!