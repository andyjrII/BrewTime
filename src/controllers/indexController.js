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
        comment,
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
    const {
      customerName,
      menuItemName,
      totalAmount,
      paymentStatus,
      transactionRef,
    } = req.body;

    // Create new order in the database
    const newOrder = await prisma.order.create({
      data: {
        customerName: customerName,
        items: menuItemName, // Save the menu item name as the items field
        totalAmount: totalAmount,
        paymentStatus: paymentStatus, // Either "Successful" or "Failed"
        createdAt: new Date(), // Automatically captures the current date and time
      },
    });

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
