let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentBookingItem = null;
let currentBookingId = null;

document.addEventListener('DOMContentLoaded', () => {
  updateUserUI();
  searchDestinations();
});

function updateUserUI() {
  const userInfo = document.getElementById('user-info');
  const authBtn = document.getElementById('auth-btn');
  const navBookings = document.getElementById('nav-bookings');

  if (currentUser) {
    userInfo.textContent = `Hello, ${currentUser.name}`;
    authBtn.textContent = 'Logout';
    authBtn.onclick = logout;
    navBookings.style.display = 'inline';
  } else {
    userInfo.textContent = '';
    authBtn.textContent = 'Login / Register';
    authBtn.onclick = openAuthModal;
    navBookings.style.display = 'none';
  }
}

function showSection(sectionId) {
  document.getElementById('home').classList.add('hidden');
  document.getElementById('my-bookings').classList.add('hidden');

  if (sectionId === 'my-bookings') {
    document.getElementById('my-bookings').classList.remove('hidden');
    loadMyBookings();
  } else {
    document.getElementById('home').classList.remove('hidden');
  }
}

async function searchDestinations() {
  const location = document.getElementById('search-location').value;
  const type = document.getElementById('search-type').value;

  const res = await fetch(`/api/destinations?location=${encodeURIComponent(location)}&type=${encodeURIComponent(type)}`);
  const data = await res.json();

  const grid = document.getElementById('destinations-grid');
  grid.innerHTML = '';

  if (data.length === 0) {
    grid.innerHTML = '<p>No destinations found matching your criteria.</p>';
    return;
  }

  const defaultFallbackImg = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500';

  data.forEach(item => {
    // If photo missing or not added, skip item if required, or display clean image fallback
    const imgSrc = item.image || defaultFallbackImg;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${imgSrc}" alt="${item.title}" onerror="this.onerror=null; this.src='${defaultFallbackImg}';">
      <div class="card-body">
        <span class="card-type">${item.type}</span>
        <h3 class="card-title">${item.title}</h3>
        <p>📍 ${item.location}</p>
        <div class="card-price">₹${item.price}</div>
        <button onclick='openBookingModal(${JSON.stringify(item)})'>Book Now</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openAuthModal() {
  document.getElementById('auth-modal').style.display = 'flex';
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  if (loginForm) loginForm.reset();
  if (regForm) regForm.reset();
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-register');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    regForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
  } else {
    regForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    // Clear any previous user state before assigning new user
    clearUserState();
    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserUI();
    closeAuthModal();
    alert('Logged in successfully!');
  } else {
    alert(data.error);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (res.ok) {
    clearUserState();
    currentUser = data.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateUserUI();
    closeAuthModal();
    alert('Registration successful!');
  } else {
    alert(data.error);
  }
}

function clearUserState() {
  currentBookingItem = null;
  currentBookingId = null;

  // Clear confidential payment & booking input data from DOM forms
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) paymentForm.reset();

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) bookingForm.reset();

  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.reset();

  const regForm = document.getElementById('register-form');
  if (regForm) regForm.reset();

  // Clear bookings list container so confidential user data is not leaked
  const list = document.getElementById('bookings-list');
  if (list) list.innerHTML = '';
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  clearUserState();
  
  closeAuthModal();
  closeBookingModal();
  closePaymentModal();

  updateUserUI();
  showSection('home');
}

function openBookingModal(item) {
  if (!currentUser) {
    alert('Please log in to book travel packages.');
    openAuthModal();
    return;
  }
  currentBookingItem = item;
  document.getElementById('booking-item-title').textContent = `${item.title} (${item.type})`;
  calculateTotal();
  document.getElementById('booking-modal').style.display = 'flex';
}

function closeBookingModal() {
  document.getElementById('booking-modal').style.display = 'none';
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) bookingForm.reset();
  currentBookingItem = null;
}

function calculateTotal() {
  const guests = parseInt(document.getElementById('book-guests').value) || 1;
  const total = currentBookingItem ? currentBookingItem.price * guests : 0;
  document.getElementById('book-total').textContent = total;
}

async function confirmBooking(e) {
  e.preventDefault();
  if (!currentUser) {
    alert('Session expired. Please log in again.');
    openAuthModal();
    return;
  }

  const date = document.getElementById('book-date').value;
  const guests = parseInt(document.getElementById('book-guests').value);
  const totalPrice = currentBookingItem.price * guests;

  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,
      destinationTitle: currentBookingItem.title,
      date,
      guests,
      totalPrice
    })
  });

  const data = await res.json();
  if (res.ok) {
    currentBookingId = data.bookingId;
    closeBookingModal();
    openPaymentModal(totalPrice);
  } else {
    alert(data.error);
  }
}

function openPaymentModal(amount) {
  document.getElementById('pay-amount').textContent = amount;
  document.getElementById('payment-modal').style.display = 'flex';
}

function closePaymentModal() {
  document.getElementById('payment-modal').style.display = 'none';
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) paymentForm.reset();
  currentBookingId = null;
}

async function processPayment(e) {
  e.preventDefault();
  if (!currentUser || !currentBookingId) {
    alert('Invalid transaction state. Please try booking again.');
    closePaymentModal();
    return;
  }

  const res = await fetch('/api/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingId: currentBookingId,
      userId: currentUser.id
    })
  });

  const data = await res.json();
  if (res.ok) {
    // Erase sensitive cardholder information and reset booking state
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) paymentForm.reset();
    currentBookingId = null;
    currentBookingItem = null;

    document.getElementById('payment-modal').style.display = 'none';
    alert('Payment Confirmed! Your trip is booked successfully.');
    showSection('my-bookings');
  } else {
    alert(data.error || 'Payment failed');
  }
}

async function loadMyBookings() {
  const list = document.getElementById('bookings-list');
  if (!currentUser) {
    list.innerHTML = '<p>Please log in to view your bookings.</p>';
    return;
  }
  const res = await fetch(`/api/bookings?userId=${currentUser.id}`);
  const bookings = await res.json();

  list.innerHTML = '';

  if (!Array.isArray(bookings) || bookings.length === 0) {
    list.innerHTML = '<p>You have no bookings yet.</p>';
    return;
  }

  bookings.forEach(b => {
    const item = document.createElement('div');
    item.className = 'booking-item';
    item.innerHTML = `
      <div>
        <h3>${b.destination_title}</h3>
        <p>Date: ${b.date} | Guests: ${b.guests}</p>
        <p>Total Paid: ₹${b.total_price}</p>
      </div>
      <div>
        <span class="badge ${b.status && b.status.includes('Confirmed') ? 'Confirmed' : 'Pending'}">${b.status}</span>
      </div>
    `;
    list.appendChild(item);
  });
}
