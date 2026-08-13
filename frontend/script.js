/**
 * Pitchpoint Labs - Interactive Functionality
 * Author: Antigravity AI
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initCounterAnimation();
  initPortfolioFilter();
  initContactForm();
  initPointCursor(); 
});
function initPointCursor() {
  const cursor = document.getElementById('pointCursor');
  if (!cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
}
/* ==========================================================================
   1. Navbar Scroll Effect & Mobile Menu Toggle
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-link');

  // Sticky Navbar Blur on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    updateActiveNavLink();
  });

  // Mobile Menu Toggle
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const isOpen = navLinks.classList.contains('active');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Active Link Tracking based on visible section
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href*="${sectionId}"]`);

      if (link) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });
  }
}

/* ==========================================================================
   2. Scroll Reveal Animations (IntersectionObserver)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   3. Animated Metric Counters
   ========================================================================== */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.counter-val');
  let animated = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const prefix = counter.getAttribute('data-prefix') || '';
          const suffix = counter.getAttribute('data-suffix') || '';
          const duration = 2000; // ms
          const step = Math.ceil(target / (duration / 16));

          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              counter.innerText = prefix + target + suffix;
              clearInterval(timer);
            } else {
              counter.innerText = prefix + current + suffix;
            }
          }, 16);
        });
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    counterObserver.observe(heroStats);
  }
}

/* ==========================================================================
   4. Portfolio Filtering Logic
   ========================================================================== */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      portfolioCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   5. Contact Form Validation & Toast Notification
   ========================================================================== */

// Change this to your deployed backend URL once it's live
// (e.g. 'https://pitchpoint-backend.onrender.com/api/contact').
// While developing locally with Live Server, leave it pointing at localhost:5000.
const CONTACT_API_URL = 'http://localhost:5000/api/contact';

function initContactForm() {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    try {
      const response = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, service, message }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }

      showToast(`Thank you, ${name}! Your message has been received. We'll be in touch shortly.`, 'success');
      form.reset();
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showToast(messageText, type = 'success') {
    if (!toast) return;

    const toastMsg = toast.querySelector('.toast-message');
    if (toastMsg) toastMsg.innerText = messageText;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}
