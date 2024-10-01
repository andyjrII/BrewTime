const express = require('express');
const router = express.Router();
const prisma = require('../models');
const upload = require('../config/multer');
const verifyAdmin = require('../middleware/VerifyAdmin');
const adminController = require('../controllers/adminController');

// Admin routes
router.get('/', verifyAdmin, async (req, res) =>
  res.redirect('/admin/dashboard')
);

router.get('/login', (req, res) => {
  res.render('admin/login');
});

router.get('/dashboard', verifyAdmin, adminController.getDashboard);

router.post('/login', adminController.postLogin);

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login');
});

// View all menu items
router.get('/menu', verifyAdmin, async (req, res) => {
  const menuItems = await prisma.menu.findMany();
  res.render('admin/menu', { menuItems });
});

router.get('/menu/add', verifyAdmin, (req, res) => {
  res.render('admin/addMenu');
});

// Add new menu item
router.post(
  '/menu/add',
  verifyAdmin,
  upload.single('image'),
  adminController.postAddMenu
);

// Edit menu item
router.post('/menu/edit/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;
  await prisma.menu.update({
    where: { id: Number(id) },
    data: { name, description, price, image },
  });
  res.redirect('/admin/menu');
});

// Delete menu item
router.post('/menu/delete/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.menu.delete({ where: { id: Number(id) } });
  res.redirect('/admin/menu');
});

// View all orders
router.get('/orders', verifyAdmin, async (req, res) => {
  const orders = await prisma.order.findMany();
  res.render('admin/orders', { orders });
});

// Update order status
router.post('/orders/update/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await prisma.order.update({
    where: { id: Number(id) },
    data: { paymentStatus: status },
  });
  res.redirect('/admin/orders');
});

// View all reviews
router.get('/reviews', verifyAdmin, async (req, res) => {
  const reviews = await prisma.review.findMany();
  res.render('admin/reviews', { reviews });
});

// Delete review
router.post('/reviews/delete/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.review.delete({ where: { id: Number(id) } });
  res.redirect('/admin/reviews');
});

module.exports = router;
