const express = require('express');
const router = express.Router();
const { createContact, getContacts } = require('../controllers/contactController');
const requireAdminKey = require('../middleware/requireAdminKey');

// POST /api/contact  (public - anyone can submit the form)
router.post('/', createContact);

// GET /api/contact  (admin only - requires x-admin-key header, see .env)
router.get('/', requireAdminKey, getContacts);

module.exports = router;
