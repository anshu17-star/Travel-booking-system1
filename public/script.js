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

  const defaultFallbackImg = '/images/default_travel.jpg';

  data.forEach(item => {
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

  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) paymentForm.reset();

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) bookingForm.reset();

  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.reset();

  const regForm = document.getElementById('register-form');
  if (regForm) regForm.reset();

  clearValidationErrors();

  const list = document.getElementById('bookings-list');
  if (list) list.innerHTML = '';
}

function clearValidationErrors() {
  const dateError = document.getElementById('date-error');
  if (dateError) {
    dateError.textContent = '';
    dateError.classList.add('hidden');
  }
  const cardError = document.getElementById('card-error');
  if (cardError) {
    cardError.textContent = '';
    cardError.classList.add('hidden');
  }
  const expiryError = document.getElementById('expiry-error');
  if (expiryError) {
    expiryError.textContent = '';
    expiryError.classList.add('hidden');
  }

  const inputs = document.querySelectorAll('input.input-error');
  inputs.forEach(input => input.classList.remove('input-error'));
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

function getTomorrowDateStr() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function openBookingModal(item) {
  if (!currentUser) {
    alert('Please log in to book travel packages.');
    openAuthModal();
    return;
  }
  currentBookingItem = item;
  document.getElementById('booking-item-title').textContent = `${item.title} (${item.type})`;

  // Restrict HTML5 min date to tomorrow onwards
  const dateInput = document.getElementById('book-date');
  const tomorrowStr = getTomorrowDateStr();
  dateInput.min = tomorrowStr;
  
  clearValidationErrors();
  calculateTotal();
  document.getElementById('booking-modal').style.display = 'flex';
}

function closeBookingModal() {
  document.getElementById('booking-modal').style.display = 'none';
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) bookingForm.reset();
  clearValidationErrors();
  currentBookingItem = null;
}

function calculateTotal() {
  const guests = parseInt(document.getElementById('book-guests').value) || 1;
  const total = currentBookingItem ? currentBookingItem.price * guests : 0;
  document.getElementById('book-total').textContent = total;
}

function validateBookingDate() {
  const dateInput = document.getElementById('book-date');
  const dateError = document.getElementById('date-error');
  const selectedDateStr = dateInput.value;

  dateInput.classList.remove('input-error');
  dateError.classList.add('hidden');
  dateError.textContent = '';

  if (!selectedDateStr) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(selectedDateStr + 'T00:00:00');

  // Must be strictly after today (i.e. selectedDate > today)
  if (selectedDate <= today) {
    dateInput.classList.add('input-error');
    dateError.textContent = '❌ Error: Booking date must be after today\'s date!';
    dateError.classList.remove('hidden');
    return false;
  }

  return true;
}

async function confirmBooking(e) {
  e.preventDefault();
  if (!currentUser) {
    alert('Session expired. Please log in again.');
    openAuthModal();
    return;
  }

  if (!validateBookingDate()) {
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
  clearValidationErrors();
  document.getElementById('payment-modal').style.display = 'flex';
}

function closePaymentModal() {
  document.getElementById('payment-modal').style.display = 'none';
  const paymentForm = document.getElementById('payment-form');
  if (paymentForm) paymentForm.reset();
  clearValidationErrors();
  currentBookingId = null;
}

function validatePaymentDetails() {
  clearValidationErrors();
  let isValid = true;

  const cardInput = document.getElementById('pay-card');
  const expiryInput = document.getElementById('pay-expiry');
  const cvvInput = document.getElementById('pay-cvv');

  const cardError = document.getElementById('card-error');
  const expiryError = document.getElementById('expiry-error');

  // Validate Card Number (16 digits)
  const cardNumber = cardInput.value.replace(/\s+/g, '');
  if (!/^\d{16}$/.test(cardNumber)) {
    cardInput.classList.add('input-error');
    cardError.textContent = '❌ Card number must be exactly 16 digits.';
    cardError.classList.remove('hidden');
    isValid = false;
  }

  // Validate Card Validity MM/YY (must be after current month & current year)
  const expiryVal = expiryInput.value.trim();
  const expiryMatch = expiryVal.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);

  if (!expiryMatch) {
    expiryInput.classList.add('input-error');
    expiryError.textContent = '❌ Invalid format! Please enter MM/YY (e.g. 10/26).';
    expiryError.classList.remove('hidden');
    isValid = false;
  } else {
    const expMonth = parseInt(expiryMatch[1], 10);
    const expYearTwoDigits = parseInt(expiryMatch[2], 10);
    const expFullYear = 2000 + expYearTwoDigits;

    const now = new Date();
    const currentFullYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1 to 12

    // Validity MUST be strictly after the current month and current year
    const isAfterCurrentMonthAndYear = (expFullYear > currentFullYear) ||
      (expFullYear === currentFullYear && expMonth > currentMonth);

    if (!isAfterCurrentMonthAndYear) {
      expiryInput.classList.add('input-error');
      expiryError.textContent = '❌ Error: Card validity must be AFTER current month and year!';
      expiryError.classList.remove('hidden');
      isValid = false;
    }
  }

  // Validate CVV (3 digits)
  const cvvVal = cvvInput.value.trim();
  if (!/^\d{3}$/.test(cvvVal)) {
    cvvInput.classList.add('input-error');
    if (!expiryError.textContent) {
      expiryError.textContent = '❌ CVV must be exactly 3 digits.';
      expiryError.classList.remove('hidden');
    }
    isValid = false;
  }

  return isValid;
}

async function processPayment(e) {
  e.preventDefault();
  if (!currentUser || !currentBookingId) {
    alert('Invalid transaction state. Please try booking again.');
    closePaymentModal();
    return;
  }

  if (!validatePaymentDetails()) {
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
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) paymentForm.reset();
    clearValidationErrors();
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
