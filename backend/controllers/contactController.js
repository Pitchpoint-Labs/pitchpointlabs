const pool = require('../config/db');
const nodemailer = require('nodemailer');
 
// --- Mail transporter (created once, reused for every request) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});
 
transporter.verify((err, success) => {
  if (err) {
    console.error('Email transporter error:', err.message);
  } else {
    console.log('Email transporter ready:', success);
  }
});
 
// POST /api/contact  -> save a new contact/lead submission
async function createContact(req, res) {
  try {
    const { name, email, service, message } = req.body;
 
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required.',
      });
    }
 
    // 1. Save to MySQL
    const [result] = await pool.query(
      'INSERT INTO clients (name, email, service, message) VALUES (?, ?, ?, ?)',
      [name, email, service || null, message]
    );
 
    // 2. Notify yourself by email — only runs if the insert above succeeded.
    //    If the email fails, we still return success to the client, since
    //    their data is already safely saved.
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'pitchpointlabs@gmail.com',
        subject: `New client registered: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nService: ${service || 'N/A'}\nMessage: ${message}`
      });
    } catch (mailErr) {
      console.error('Client saved, but notification email failed:', mailErr.message);
    }
 
    return res.status(201).json({
      success: true,
      message: 'Your message has been received. We will be in touch shortly.',
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error('Error saving contact:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong on our end. Please try again later.',
    });
  }
}
 
// GET /api/contact  -> list submissions (protected by requireAdminKey middleware)
async function getContacts(req, res) {
  try {
    const [contacts] = await pool.query(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    return res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    console.error('Error fetching contacts:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch contacts.' });
  }
}
 
module.exports = { createContact, getContacts };
 
