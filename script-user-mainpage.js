// Simulated login flag
const isLoggedIn = false; // Change to true to simulate login

window.addEventListener('DOMContentLoaded', () => {
  const joinNow = document.getElementById('joinNow');
  const userMenu = document.getElementById('userMenu');

  if (isLoggedIn) {
    joinNow.classList.add('hidden');
    userMenu.classList.remove('hidden');

    const userBtn = userMenu.querySelector('.user-btn');
    userBtn.addEventListener('click', () => {
      userMenu.classList.toggle('show');
    });
  }
});