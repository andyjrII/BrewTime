const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../models');
const upload = require('../config/multer');
const verifyAdmin = require('../middleware/VerifyAdmin');

// Admin Login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  res.cookie('adminToken', token, { httpOnly: true });
  res.redirect('/admin/dashboard');
};

// Add new menu item
exports.postAddMenu = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file.path;

    // Create new menu item
    await prisma.menu.create({
      data: { name, description, price: parseFloat(price), image },
    });

    res.redirect('/admin/menu');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating menu item');
  }
};
