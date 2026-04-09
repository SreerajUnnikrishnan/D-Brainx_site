import './style.css'

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    // Basic toggle - in a real app, we'd add a mobile menu class
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '100%';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'var(--bg-dark)';
    navLinks.style.padding = '2rem';
    
    navActions.style.display = navActions.style.display === 'flex' ? 'none' : 'flex';
    navActions.style.flexDirection = 'column';
    navActions.style.position = 'absolute';
    navActions.style.top = '250px';
    navActions.style.left = '0';
    navActions.style.right = '0';
    navActions.style.background = 'var(--bg-dark)';
    navActions.style.padding = '2rem';
  });
}

// Active link highlighting
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});
