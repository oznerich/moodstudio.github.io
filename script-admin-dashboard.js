function showTab(tabId, element) {
  // Hide all tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  // Remove 'active' class from all sidebar items
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Show the selected tab
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.add("active");
  }

  // Set clicked sidebar item as active
  if (element) {
    element.classList.add("active");
  }
}


  function togglePassword() {
    const passwordField = document.getElementById("password");
    passwordField.type = passwordField.type === "password" ? "text" : "password";
    
  }

    document.getElementById("appointmentTime").addEventListener("input", function (e) {
    const time = e.target.value;
    if (time < "12:00" || time > "19:00") {
      alert("Please select a time between 12:00 PM and 7:00 PM.");
      e.target.value = "";
    }
  });

  document.getElementById("appointmentDate").addEventListener("input", function (e) {
    const date = new Date(e.target.value);
    const day = date.getDay();
    if (day === 1) {
      alert("Appointments are not available on Mondays.");
      e.target.value = "";
    }
  });

  // Booking History
  function printReceipt(name, packageName, date) {
  const receiptWindow = window.open('', '_blank');
  receiptWindow.document.write(`
    <html>
    <head><title>Official Receipt</title></head>
    <body>
      <h2>Official Receipt</h2>
      <p>Name: ${name}</p>
      <p>Package: ${packageName}</p>
      <p>Date: ${date}</p>
      <hr>
      <p>Thank you for booking at Mood Studios!</p>
      <script>window.print();</script>
    </body>
    </html>
  `);
  receiptWindow.document.close();
}

function filterBookings() {
  const filter = document.getElementById('bookingFilter').value;
  const items = document.querySelectorAll('#bookingList .user-item');
  const now = new Date();

  items.forEach((item) => {
    const dateStr = item.getAttribute('data-date');
    const bookingDate = new Date(dateStr);
    let show = false;

    switch (filter) {
      case 'day':
        show = bookingDate.toDateString() === now.toDateString();
        break;
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        show = bookingDate >= startOfWeek && bookingDate <= endOfWeek;
        break;
      case 'month':
        show = bookingDate.getMonth() === new Date().getMonth() &&
               bookingDate.getFullYear() === new Date().getFullYear();
        break;
      case 'year':
        show = bookingDate.getFullYear() === new Date().getFullYear();
        break;
      default:
        show = true;
    }

    item.style.display = show ? 'flex' : 'none';
  });
}