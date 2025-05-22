// Ease-in cubic function for animation timing
function easeInCubic(t) {
  return t * t * t;
}

function scrollToY(targetY, duration = 800) {
  const startY = window.scrollY || window.pageYOffset;
  const distanceY = targetY - startY;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeProgress = easeInCubic(progress);
    window.scrollTo(0, startY + distanceY * easeProgress);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

document.querySelectorAll('.nav-item a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const href = link.getAttribute("href");
    if (!href || href[0] !== "#") return;

    const targetEl = document.querySelector(href);
    if (!targetEl) return;

    // Calculate target position accounting for fixed navbar height
    const navbarHeight = document.querySelector(".navbar").offsetHeight;
    const targetPosition =
      targetEl.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

    scrollToY(targetPosition, 800); // 800ms duration
  });
});

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-item a");

function changeActiveLink() {
  let index = sections.length;

  while (--index && window.scrollY + 70 < sections[index].offsetTop) {}

  navLinks.forEach((link) => link.classList.remove("active"));
  navLinks[index].classList.add("active");
}

changeActiveLink();
window.addEventListener("scroll", changeActiveLink);

function handleLogout(event) {
  event.target.blur();
  event.preventDefault(); // prevents href="#" from jumping up
  if (confirm("Are you sure you want to log out?")) {
    window.location.href = "index.html";
  }
}
