const prisma = require('../models');

exports.getHomePage = async (req, res) => {
  try {
    const menuItems = await prisma.menu.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
      },
    });
    res.render('index', { menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading menu items');
  }
};

exports.getMenuItemDetails = async (req, res) => {
  const menuItemId = parseInt(req.params.id);

  try {
    const menuItem = await prisma.menu.findUnique({
      where: { id: menuItemId },
      include: {
        reviews: true,
      },
    });

    if (!menuItem) {
      return res.status(404).send('Menu item not found');
    }

    res.render('menuDetails', { menuItem });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading menu item details');
  }
};

exports.postAddReview = async (req, res) => {
  const menuItemId = parseInt(req.params.id);
  const { customerName, comment } = req.body;

  try {
    await prisma.review.create({
      data: {
        customerName,
        review: comment,
        menuId: menuItemId, // Assuming the relation is set in the database
      },
    });

    res.redirect(`/menu/${menuItemId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding review');
  }
};

// POST route to save the order
exports.postSaveOrder = async (req, res) => {
  try {
    // Destructure the fields from the request body
    const { customerName, menuItemName, totalAmount, paymentStatus } = req.body;

    // Check if the required fields are provided
    if (!customerName || !menuItemName || !totalAmount || !paymentStatus) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields. Please ensure customerName, menuItemName, totalAmount, and paymentStatus are provided.',
      });
    }

    // Create a new order in the database
    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName,
        items: menuItemName, // Save the menu item name as the items field
        totalAmount: parseFloat(totalAmount), // Ensure totalAmount is a float
        paymentStatus: paymentStatus, // Either "Successful" or "Failed"
        createdAt: new Date(), // Automatically captures the current date and time
      },
    });

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: 'Order saved successfully!',
      order: newOrder,
    });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save order.',
      error: error.message,
    });
  }
};
