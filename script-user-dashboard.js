import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Initialize Supabase client
const supabase = createClient(
  'https://rdgahcjjbewvyqcfdtih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU'
);

// Global variables
let currentUser = null;
let userBookings = [];
let userGallery = [];
let userReviews = [];

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
});

async function initializeDashboard() {
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = 'user-mainpage.html';
    return;
  }
  
  // Load all data
  try {
    await Promise.all([
      loadUserProfile(user.id),
      loadUserBookings(user.id),
      loadUserGallery(user.id),
      loadUserReviews(user.id)
    ]);
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to load dashboard data');
  }

  // Setup event listeners
  setupEventListeners();
}

// Data loading functions
async function loadUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    currentUser = data;
    updateUserProfileUI();
  } catch (error) {
    console.error('Error loading user profile:', error);
    throw error;
  }
}

async function loadUserBookings(userId) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    userBookings = data;
    renderBookings();
  } catch (error) {
    console.error('Error loading bookings:', error);
    throw error;
  }
}

async function loadUserGallery(userId) {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: false });
    
    if (error) throw error;
    
    userGallery = data;
    renderGallery();
  } catch (error) {
    console.error('Error loading gallery:', error);
    throw error;
  }
}

async function loadUserReviews(userId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        appointments!inner(
          session_type,
          date
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Format reviews with booking info
    userReviews = data.map(review => ({
      ...review,
      booking_session: review.appointments.session_type,
      booking_date: review.appointments.date
    }));
    
    renderReviews();
  } catch (error) {
    console.error('Error loading reviews:', error);
    throw error;
  }
}

// Action functions with Supabase integration
async function createNewBooking() {
  const form = document.getElementById('bookingForm');
  const formData = {
    user_id: currentUser.id,
    session_type: document.getElementById('sessionType').value,
    date: `${document.getElementById('bookingDate').value}T${document.getElementById('bookingTime').value}:00`,
    notes: document.getElementById('bookingNotes').value,
    status: 'scheduled'
  };
  
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert(formData)
      .select();
    
    if (error) throw error;
    
    alert('Booking created successfully!');
    closeModal();
    form.reset();
    await loadUserBookings(currentUser.id);
  } catch (error) {
    console.error('Error creating booking:', error);
    alert('Failed to create booking: ' + error.message);
  }
}

async function editBooking(bookingId) {
  const booking = userBookings.find(b => b.id === bookingId);
  if (!booking) return;
  
  const newDate = prompt('Enter new date (YYYY-MM-DD):', booking.date.split('T')[0]);
  if (!newDate) return;
  
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ date: newDate + 'T' + booking.date.split('T')[1] })
      .eq('id', bookingId);
    
    if (error) throw error;
    
    alert('Booking updated successfully');
    await loadUserBookings(currentUser.id);
  } catch (error) {
    console.error('Error updating booking:', error);
    alert('Failed to update booking: ' + error.message);
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  
  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    
    if (error) throw error;
    
    alert('Booking cancelled successfully');
    await loadUserBookings(currentUser.id);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    alert('Failed to cancel booking: ' + error.message);
  }
}

async function submitReview() {
  const form = document.getElementById('reviewForm');
  const formData = {
    booking_id: document.getElementById('reviewBookingId').value,
    user_id: currentUser.id,
    rating: document.getElementById('ratingValue').value,
    comment: document.getElementById('reviewText').value
  };
  
  try {
    const { error } = await supabase
      .from('reviews')
      .insert(formData);
    
    if (error) throw error;
    
    // Update the appointment to mark it as reviewed
    await supabase
      .from('appointments')
      .update({ has_review: true })
      .eq('id', formData.booking_id);
    
    alert('Thank you for your review!');
    closeModal();
    form.reset();
    await loadUserReviews(currentUser.id);
    await loadUserBookings(currentUser.id);
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Failed to submit review: ' + error.message);
  }
}

// Logout function with Supabase
function logout() {
  supabase.auth.signOut()
    .then(() => {
      sessionStorage.removeItem('userId');
      window.location.href = 'user-mainpage.html';
    })
    .catch(error => {
      console.error('Error signing out:', error);
      alert('Failed to logout');
    });
}

// The rest of your existing functions (UI rendering, helpers, etc.) remain the same
// Keep all the renderBookings(), renderGallery(), renderReviews() functions
// Keep all the helper functions like formatDate(), getBookingStatus(), etc.
// Keep all the modal functions and event listeners
