const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../models');
const cloudinary = require('cloudinary').v2;

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

// View all menu items
exports.getMenu = async (req, res) => {
  const menuItems = await prisma.menu.findMany();
  res.render('admin/menu', { menuItems });
};

// Add new menu item
exports.postAddMenu = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file.path;

    await prisma.menu.create({
      data: { name, description, price: parseFloat(price), image },
    });

    res.redirect('/admin/menu');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating menu item');
  }
};

// GET edit page for a menu item
exports.getEditMenu = async (req, res) => {
  const menuItemId = parseInt(req.params.id);
  const menuItem = await prisma.menu.findUnique({
    where: { id: menuItemId },
  });

  res.render('admin/editMenu', { menuItem });
};

// POST updated menu item
exports.postEditMenu = async (req, res) => {
  const menuItemId = parseInt(req.params.id);
  const { name, description, price } = req.body;
  let imageUrl = null;

  try {
    // If a new image is uploaded, handle the Cloudinary upload
    if (req.file) {
      // Upload the new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'brewtime',
        public_id: `menu_${menuItemId}`,
        overwrite: true,
      });

      imageUrl = result.secure_url;
    }

    // Prepare the updated data
    const updatedData = {
      name,
      description,
      price: parseFloat(price),
    };

    if (imageUrl) {
      updatedData.image = imageUrl; // Only update the image if a new one is uploaded
    }

    // Update the menu item in the database
    await prisma.menu.update({
      where: { id: menuItemId },
      data: updatedData,
    });

    res.redirect('/admin/menu');
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).send('Error updating menu item');
  }
};

// Delete menu item
exports.postDeleteMenu = async (req, res) => {
  const { id } = req.params;
  await prisma.menu.delete({ where: { id: Number(id) } });
  res.redirect('/admin/menu');
};

exports.manageOrders = async (req, res) => {
  try {
    // Fetch orders from the database
    const orders = await prisma.order.findMany();

    // Get success or error message from query parameters
    const successMessage = req.query.success || null;
    const errorMessage = req.query.error || null;

    // Render the manage orders page with the orders and messages
    res.render('admin/orders', { orders, successMessage, errorMessage });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.render('admin/orders', {
      orders: [],
      errorMessage: 'Failed to load orders.',
    });
  }
};

// Update the order status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params; // Get the order ID from the URL parameters
  const { status } = req.body; // Get the new status from the form submission

  try {
    // Update the order status in the database
    await prisma.order.update({
      where: { id: parseInt(id) }, // Ensure the ID is an integer
      data: { paymentStatus: status }, // Update the payment status
    });

    // Redirect back to the manage orders page with a success message
    res.redirect('/admin/orders?success=Order status updated successfully');
  } catch (error) {
    console.error('Error updating order status:', error);
    // Redirect back with an error message
    res.redirect('/admin/orders?error=Failed to update order status');
  }
};

// Delete review
exports.postDeleteReview = async (req, res) => {
  const { id } = req.params;
  await prisma.review.delete({ where: { id: Number(id) } });
  res.redirect('/admin/reviews');
};
