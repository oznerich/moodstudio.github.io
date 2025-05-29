import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = 'https://rdgahcjjbewvyqcfdtih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZ2FoY2pqYmV3dnlxY2ZkdGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzI5OTAsImV4cCI6MjA2MzMwODk5MH0.q0LtxZt6-sCWxBKpPnHc6Gn34I11KVJkqvhPHqnEqIU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.toggleDropdown = function(header) {
  const content = header.nextElementSibling;
  content.classList.toggle('hidden');
};

let selectedPackage = { name: '', imageUrl: '', price: 0 };
let selectedTime = '';
let promoDiscount = 0;

window.selectPackage = function(imageUrl, name, price) {
  document.getElementById('image-preview').innerHTML = `<img src="${imageUrl}" alt="${name}">`;
  selectedPackage = { name, imageUrl, price };
  updateTotalPrice();
  document.querySelector('.date-time').style.display = 'block';
};

window.onload = () => {
  const datePicker = document.getElementById("date-picker");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = (today.getMonth() + 1).toString().padStart(2, '0');
  const dd = today.getDate().toString().padStart(2, '0');
  datePicker.min = `${yyyy}-${mm}-${dd}`;
  document.querySelector('.booking-form').style.display = 'none';
};

window.showTimes = function() {
  const selectedDate = new Date(document.getElementById('date-picker').value);
  const day = selectedDate.getDay();
  if (day === 1) { // Monday
    alert("Closed on Mondays. Please choose another day.");
    return;
  }

  const container = document.getElementById('time-buttons');
  container.innerHTML = '';
  for (let hour = 12; hour <= 18; hour++) {
    const timeStr = `${hour}:00`;
    const btn = document.createElement("button");
    btn.textContent = timeStr;
    btn.type = "button";
    btn.onclick = () => {
      selectedTime = timeStr;
      document.querySelector('.booking-form').style.display = 'block';
      document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth' });
    };
    container.appendChild(btn);
  }
};

window.toggleGcashQR = function(value) {
  const qr = document.getElementById('gcash-qr');
  qr.style.display = (value === 'GCash') ? 'block' : 'none';
};

window.applyPromo = function() {
  const promoCode = document.getElementById('promo-code').value.trim().toUpperCase();
  // Promo example: PROMO10 gives 10% discount
  if (promoCode === "PROMO10") {
    promoDiscount = 0.1;
  } else {
    promoDiscount = 0;
  }
  updateTotalPrice();
};

function updateTotalPrice() {
  const price = selectedPackage.price || 0;
  const discountAmount = price * promoDiscount;
  const finalPrice = price - discountAmount;
  document.getElementById('total-price').textContent = `₱${finalPrice.toFixed(2)}`;
}

window.startPayment = function() {
  const paymentMethod = document.getElementById('payment-method').value;
  if (!paymentMethod) {
    alert("Please select a payment method.");
    return;
  }
  submitBooking(paymentMethod);
};

async function isDuplicateBooking(date, time, packageName) {
  const { data, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .eq('package_name', packageName)
    .limit(1);

  if (error) {
    console.error("Error checking duplicate:", error);
    return false; // fail open
  }

  return data.length > 0;
}

async function generateReceiptPdf(details) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Photography Studio Booking Receipt", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${details.firstName} ${details.lastName}`, 20, 40);
  doc.text(`Email: ${details.email}`, 20, 50);
  doc.text(`Phone: ${details.phone}`, 20, 60);
  doc.text(`Package: ${details.packageName}`, 20, 70);
  doc.text(`Date: ${details.date}`, 20, 80);
  doc.text(`Time: ${details.time}`, 20, 90);
  doc.text(`Payment Method: ${details.paymentMethod}`, 20, 100);
  doc.text(`Total Paid: ₱${details.totalPrice.toFixed(2)}`, 20, 110);
  doc.text(`Booking Status: Pending`, 20, 120);

  doc.text("Thank you for booking with us!", 20, 140);

  doc.save(`BookingReceipt_${details.firstName}_${details.date}.pdf`);
}

async function submitBooking(paymentMethod) {
  const firstName = document.getElementById('first-name').value.trim();
  const lastName = document.getElementById('last-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const date = document.getElementById('date-picker').value;

  if (!firstName || !email || !phone || !date || !selectedTime || !selectedPackage.name) {
    alert("Please fill in all required fields.");
    return;
  }

  const duplicate = await isDuplicateBooking(date, selectedTime, selectedPackage.name);
  if (duplicate) {
    alert("⚠️ This date and time for the selected package is already booked. Please choose another slot.");
    return;
  }

  const price = selectedPackage.price || 0;
  const discountAmount = price * promoDiscount;
  const finalPrice = price - discountAmount;

  const { error } = await supabase.from('appointments').insert([
    {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      package_name: selectedPackage.name,
      date,
      time: selectedTime,
      image_url: selectedPackage.imageUrl,
      payment_method: paymentMethod,
      payment_status: 'Pending',
      total_price: finalPrice
    }
  ]);

  if (error) {
    alert("Error booking: " + error.message);
  } else {
    alert("✅ Booking successful! Generating receipt PDF...");
    await generateReceiptPdf({
      firstName,
      lastName,
      email,
      phone,
      packageName: selectedPackage.name,
      date,
      time: selectedTime,
      paymentMethod,
      totalPrice: finalPrice
    });
    window.location.href = "user-mainpage.html";
  }
}

window.submitBooking = submitBooking; // expose to window
