
function handleLogin(username) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    window.location.href = 'dashboard.html';
}

function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
    return isLoggedIn;
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}


function displayUser() {
    const username = localStorage.getItem('username');
    if (username) {
        document.querySelectorAll('#loggedInUser, #welcomeUser').forEach(el => {
            el.textContent = username;
        });
    }
}


if (document.querySelector('.dashboard-container')) {
    checkAuth();
    displayUser();
}