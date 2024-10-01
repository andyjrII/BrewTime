const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../models');

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

exports.getDashboard = async (req, res) => {
  try {
    // Fetch totals
    const totalMenuItems = await prisma.menu.count();
    const totalOrders = await prisma.order.count();
    const totalReviews = await prisma.review.count();

    // Render the dashboard page with totals
    res.render('admin/dashboard', {
      totalMenuItems,
      totalOrders,
      totalReviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading admin dashboard');
  }
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
