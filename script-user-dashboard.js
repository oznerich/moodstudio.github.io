import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Initialize Supabase client
const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Globals
let currentUser = null;
let userBookings = [];
let userGallery = [];

document.addEventListener('DOMContentLoaded', async () => {
  await initializeDashboard();

  // Setup nav buttons
  window.showSection = showSection;
  window.logout = logout;

  // Setup upload button
  document.getElementById('upload-btn').onclick = uploadPhoto;

  // Setup sort select change event for bookings
  const sortSelect = document.getElementById('sort');
  if (sortSelect) {
    sortSelect.onchange = sortBookings;
  }
});

async function initializeDashboard() {
  // Check user login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = 'user-mainpage.html'; // redirect if no user
    return;
  }
  currentUser = user;

  // Load user data
  await Promise.all([loadUserBookings(), loadUserGallery()]);

  // Show default section
  showSection('bookings');
}

function showSection(sectionId) {
  document.querySelectorAll('main .section').forEach((section) => {
    section.classList.toggle('active', section.id === sectionId);
  });
}

// -------- BOOKINGS --------

async function loadUserBookings() {
  try {
    // Your appointments table does not have user_id but has email, so match by email
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('email', currentUser.email)
      .order('date', { ascending: true });

    if (error) throw error;

    userBookings = data || [];
    renderBookings();
  } catch (error) {
    console.error('Error loading bookings:', error);
    alert('Failed to load bookings');
  }
}

function renderBookings() {
  const bookingList = document.getElementById('booking-list');
  bookingList.innerHTML = '';

  if (userBookings.length === 0) {
    bookingList.innerHTML = '<p>No bookings found.</p>';
    return;
  }

  userBookings.forEach((booking) => {
    const card = document.createElement('div');
    card.className = 'booking-card';

    card.innerHTML = `
      <p><strong>Package:</strong> ${booking.package_name}</p>
      <p><strong>Date & Time:</strong> ${formatDate(booking.date)} at ${booking.time}</p>
      <p><strong>Status:</strong> ${capitalize(booking.payment_status || 'Pending')}</p>
      <div class="booking-actions"></div>
    `;

    const actions = card.querySelector('.booking-actions');

    // Add Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editBooking(booking.id);
    actions.appendChild(editBtn);

    // Print Official Receipt button (dummy for now)
    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print Official Receipt';
    printBtn.onclick = () => alert('Printing receipt (not implemented)');
    actions.appendChild(printBtn);

    // Cancel button if status not cancelled or completed
    if (!['cancelled', 'completed'].includes(booking.payment_status?.toLowerCase())) {
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.onclick = () => cancelBooking(booking.id);
      actions.appendChild(cancelBtn);
    }

    // Leave Review button if completed and no review (Assuming you have review logic)
    if (booking.payment_status?.toLowerCase() === 'completed') {
      // Here you might check if review exists, skipped for brevity
      const reviewBtn = document.createElement('button');
      reviewBtn.textContent = 'Leave Review';
      reviewBtn.onclick = () => alert('Review feature coming soon');
      actions.appendChild(reviewBtn);
    }

    bookingList.appendChild(card);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function editBooking(id) {
  // For demo, only editing date and time here
  const newDate = prompt('Enter new date (YYYY-MM-DD):');
  if (!newDate) return;
  const newTime = prompt('Enter new time (HH:mm):');
  if (!newTime) return;

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ date: newDate, time: newTime, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    alert('Booking updated');
    await loadUserBookings();
  } catch (error) {
    console.error(error);
    alert('Failed to update booking');
  }
}

async function cancelBooking(id) {
  if (!confirm('Cancel this booking?')) return;
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ payment_status: 'Cancelled', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    alert('Booking cancelled');
    await loadUserBookings();
  } catch (error) {
    console.error(error);
    alert('Failed to cancel booking');
  }
}

function sortBookings() {
  const sortBy = document.getElementById('sort').value;
  const now = new Date();
  let filtered = [...userBookings];

  switch (sortBy) {
    case 'day':
      filtered = filtered.filter(b => isSameDay(new Date(b.date), now));
      break;
    case 'week':
      filtered = filtered.filter(b => isSameWeek(new Date(b.date), now));
      break;
    case 'month':
      filtered = filtered.filter(b => isSameMonth(new Date(b.date), now));
      break;
    case 'year':
      filtered = filtered.filter(b => isSameYear(new Date(b.date), now));
      break;
  }

  renderFilteredBookings(filtered);
}

function renderFilteredBookings(filtered) {
  const bookingList = document.getElementById('booking-list');
  bookingList.innerHTML = '';

  if (filtered.length === 0) {
    bookingList.innerHTML = '<p>No bookings found for this period.</p>';
    return;
  }

  filtered.forEach((booking) => {
    const card = document.createElement('div');
    card.className = 'booking-card';

    card.innerHTML = `
      <p><strong>Package:</strong> ${booking.package_name}</p>
      <p><strong>Date & Time:</strong> ${formatDate(booking.date)} at ${booking.time}</p>
      <p><strong>Status:</strong> ${capitalize(booking.payment_status || 'Pending')}</p>
    `;

    bookingList.appendChild(card);
  });
}

// Date helpers
function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

function isSameWeek(d1, d2) {
  const dayOfWeek = d2.getDay(); // 0 (Sun) to 6 (Sat)
  const startOfWeek = new Date(d2);
  startOfWeek.setDate(d2.getDate() - dayOfWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return d1 >= startOfWeek && d1 <= endOfWeek;
}

function isSameMonth(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth();
}

function isSameYear(d1, d2) {
  return d1.getFullYear() === d2.getFullYear();
}

// -------- LOGOUT --------

async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('Logout failed');
    return;
  }
  window.location.href = 'user-mainpage.html';
}

// -------- GALLERY --------

const galleryEl = document.getElementById('gallery-container');
const fileInput = document.getElementById('file-input');

async function loadUserGallery() {
  try {
    // Fetch gallery photos for user
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    userGallery = data || [];
    renderGallery();
  } catch (error) {
    console.error('Error loading gallery:', error);
    alert('Failed to load gallery photos');
  }
}

function renderGallery() {
  galleryEl.innerHTML = '';

  if (userGallery.length === 0) {
    galleryEl.innerHTML = '<p>No photos uploaded yet.</p>';
    return;
  }

  userGallery.forEach(photo => {
    const card = createPhotoCard(photo);
    galleryEl.appendChild(card);
  });
}

function createPhotoCard(photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  // Image element
  const img = document.createElement('img');
  img.src = getPublicUrl(photo.image_path);
  img.alt = 'User photo';

  // Filter sliders container
  const filterControls = document.createElement('div');
  filterControls.className = 'filter-controls';

  // Filters with default values
  const filters = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    blur: 0
  };

  // Create sliders for each filter
  Object.entries(filters).forEach(([filter, defaultVal]) => {
    const label = document.createElement('label');
    label.textContent = filter.charAt(0).toUpperCase() + filter.slice(1);
    label.htmlFor = `${filter}-${photo.id}`;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = filter === 'blur' ? 0 : 0;
    input.max = filter === 'blur' ? 10 : (filter === 'hueRotate' ? 360 : 200);
    input.value = defaultVal;
    input.id = `${filter}-${photo.id}`;

    // Update filters on change
    input.oninput = () => {
      filters[filter] = input.value;
      updateImageFilter(img, filters);
    };

    label.appendChild(input);
    filterControls.appendChild(label);
  });

  // Save button
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save Edited Photo';
  saveBtn.onclick = () => saveEditedPhoto(photo, filters);

  card.appendChild(img);
  card.appendChild(filterControls);
  card.appendChild(saveBtn);

  return card;
}

function updateImageFilter(img, filters) {
  const filterStr = `
    brightness(${filters.brightness}%)
    contrast(${filters.contrast}%)
    saturate(${filters.saturate}%)
    grayscale(${filters.grayscale}%)
    sepia(${filters.sepia}%)
    hue-rotate(${filters.hueRotate}deg)
    blur(${filters.blur}px)
  `;
  img.style.filter = filterStr;
}

function getPublicUrl(path) {
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
}

async function uploadPhoto() {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a photo to upload.');
    return;
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
  const filePath = fileName;

  try {
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    // Insert record in gallery table
    const { error: dbError } = await supabase
      .from('gallery')
      .insert([{ user_id: currentUser.id, image_path: filePath }]);
    if (dbError) throw dbError;

    alert('Photo uploaded successfully.');
    fileInput.value = '';
    await loadUserGallery();
  } catch (error) {
    console.error(error);
    alert('Failed to upload photo.');
  }
}

async function saveEditedPhoto(photo, filters) {
  // Create canvas and apply filters to image, then upload as new file
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = getPublicUrl(photo.image_path);

  img.onload = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');

    // Apply filters using CSS filter string
    const filterStr = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturate}%)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
      hue-rotate(${filters.hueRotate}deg)
      blur(${filters.blur}px)
    `;
    ctx.filter = filterStr;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Convert to blob and upload
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert('Failed to save edited photo');
        return;
      }

      const editedFileName = `${currentUser.id}/edited_${Date.now()}.png`;
      try {
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(editedFileName, blob, { upsert: true });
        if (uploadError) throw uploadError;

        // Insert new photo record
        const { error: dbError } = await supabase
          .from('gallery')
          .insert([{ user_id: currentUser.id, image_path: editedFileName }]);
        if (dbError) throw dbError;

        alert('Edited photo saved successfully.');
        await loadUserGallery();
      } catch (error) {
        console.error(error);
        alert('Failed to save edited photo.');
      }
    }, 'image/png');
  };

  img.onerror = () => {
    alert('Failed to load image for editing.');
  };
}
