// Drop this in place of the setTimeout(...) block inside initContactForm()
// in your existing script.js. It replaces the simulated submit with a real
// POST request to the Node/Express/MongoDB backend.

const API_URL = 'http://localhost:5000/api/contact'; // change if you deploy elsewhere

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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, service, message }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Something went wrong.');
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
