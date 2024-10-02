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
router.post('/login', adminController.postLogin);

router.get('/dashboard', verifyAdmin, adminController.getDashboard);

// View all menu items
router.get('/menu', verifyAdmin, adminController.getMenu);

// Add new menu item
router.get('/menu/add', verifyAdmin, (req, res) => {
  res.render('admin/addMenu');
});
router.post(
  '/menu/add',
  verifyAdmin,
  upload.single('image'),
  adminController.postAddMenu
);

// Edit menu item
router.get('/menu/:id/edit', verifyAdmin, adminController.getEditMenu);
router.post(
  '/menu/:id/edit',
  verifyAdmin,
  upload.single('image'),
  adminController.postEditMenu
);

// Delete menu item
router.post('/menu/:id/delete', verifyAdmin, adminController.postDeleteMenu);

// route to manage orders
router.get('/orders', adminController.manageOrders);

// Update order status
router.post('/orders/update/:id', adminController.updateOrderStatus);

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

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login');
});

module.exports = router;
