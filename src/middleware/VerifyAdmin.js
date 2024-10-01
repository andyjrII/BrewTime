const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  const token = req.cookies.adminToken;
  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next();
  } catch (error) {
    res.redirect('/admin/login');
  }
}

module.exports = verifyAdmin;
