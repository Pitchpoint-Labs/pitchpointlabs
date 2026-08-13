// Very simple protection for admin-only routes (e.g. listing all contact submissions).
// Requires the caller to send a header: x-admin-key: <value matching ADMIN_KEY in .env>
// This is intentionally lightweight for a small project; for anything more sensitive,
// use a real auth system (JWT login, sessions, etc.) instead.

function requireAdminKey(req, res, next) {
  const providedKey = req.header('x-admin-key');
  const expectedKey = process.env.ADMIN_KEY;

  if (!expectedKey) {
    // Fail closed: if no admin key is configured on the server, block access
    // rather than silently allowing it.
    return res.status(500).json({ success: false, error: 'Admin access is not configured.' });
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized.' });
  }

  next();
}

module.exports = requireAdminKey;
